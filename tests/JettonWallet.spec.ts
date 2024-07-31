import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { JettonMaster } from '@ton/ton';
import { Master } from '../wrappers/Master';
import { randomAddress } from '@ton/test-utils';

describe('JettonWallet', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('JettonWallet');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonWallet: SandboxContract<JettonWallet>;
    let chceckbalance: SandboxContract<JettonWallet>;
    let owner:SandboxContract<TreasuryContract>
    let admin_address:SandboxContract<TreasuryContract>
    let jetton_master :SandboxContract<Master>



    beforeEach(async () => {
        blockchain = await Blockchain.create();

        owner = await  blockchain.treasury("owner");
        //jetton_master = await blockchain.treasury("jetton_master")
        
        admin_address = await blockchain.treasury("admin_address");
       jetton_master = blockchain.openContract(Master.createFromConfig({
            admin_address:admin_address.address,
            jetton_wallet_code:await compile("JettonWallet")
        }, code));
        
     
        jettonWallet = blockchain.openContract(JettonWallet.createFromConfig({
            balance:toNano("200"),
            owner_address:owner.getSender().address,
            jetton_master_address:jetton_master.address,
            jetton_wallet_code:code
        }, code));

       // console.log(jettonWallet)

        chceckbalance = blockchain.openContract(JettonWallet.createFromConfig({
            balance:toNano("0"),
            owner_address:admin_address.address,
            jetton_master_address:jetton_master.address,
            jetton_wallet_code:code
        }, code));

      //  console.log(chceckbalance)



        deployer = await blockchain.treasury('deployer');

        const deployResult = await jettonWallet.sendDeploy(deployer.getSender(), toNano('0.05'));
        await chceckbalance.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonWallet.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonWallet are ready to use
    });

    it(" transfer token function" , async () => {

        await jettonWallet.getAddress(owner.getSender().address);
        await jettonWallet.getAddress(admin_address.address)

        await jettonWallet.getWalletData();
        await chceckbalance.getWalletData();

        
         const result = await jettonWallet.sendTransfertoken(owner.getSender(),{
            value:toNano("5"),
            recipient:admin_address.address,
            forwardValue:toNano("0.2"),
            amount:toNano("2")
         })
       

         expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: jettonWallet.address,
            success: true,
        });

        await jettonWallet.getWalletData();
        await chceckbalance.getWalletData();       
    })

    it("burn tokens", async () => {
        const result = await jettonWallet.sendBurns(owner.getSender(),{
            value:toNano("1"),
            amount:toNano("20"),
            forwardValue:toNano("0.2")
        })

        //console.log(result.transactions)

        await jettonWallet.getWalletData();
    })

   
});






