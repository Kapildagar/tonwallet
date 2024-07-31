import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Airdrop } from '../wrappers/Airdrop';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Airdrop', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Airdrop');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let airdrop: SandboxContract<Airdrop>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        airdrop = blockchain.openContract(Airdrop.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await airdrop.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: airdrop.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and airdrop are ready to use
    });
});
