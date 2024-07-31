import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Master } from '../wrappers/Master';

import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Master', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Master');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let master: SandboxContract<Master>;
    let admin_address:SandboxContract<TreasuryContract>

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        admin_address = await blockchain.treasury("admin_address");
        master = blockchain.openContract(Master.createFromConfig({
            admin_address:admin_address.address,
            jetton_wallet_code:await compile("JettonWallet")
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await master.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: master.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and master are ready to use
    });

    it("should mint jetton" , async () =>{
      
        const user = await blockchain.treasury("user");

        const res = await master.sendMint(admin_address.getSender(), {
            value: toNano('0.1'),
            toAddress: user.address,
            amount: toNano('0.05'),
            jettonAmount: toNano('100'),
        });

        expect(res.transactions).toHaveTransaction({
            from: admin_address.address,
            to: master.address,
            success: true,
            op: 21,
            outMessagesCount: 1,
        });

        const newTotalSupply = await master.getTotalSupply();

        expect(newTotalSupply).toEqual(toNano('100'));
    })

    // it("should transfer token" , async ()=>{
        
    // })
});
