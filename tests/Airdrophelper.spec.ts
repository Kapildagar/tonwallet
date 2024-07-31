import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Airdrophelper } from '../wrappers/Airdrophelper';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Airdrophelper', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Airdrophelper');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let airdrophelper: SandboxContract<Airdrophelper>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        airdrophelper = blockchain.openContract(Airdrophelper.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await airdrophelper.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: airdrophelper.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and airdrophelper are ready to use
    });
});
