import { toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Blockchain } from '@ton/sandbox';

export async function run(provider: NetworkProvider) {
    
     const blockchain = await Blockchain.create();
     const owner = await blockchain.treasury("owner");
     const jetton_master = await blockchain.treasury("jetton_master");


    const jettonWallet = provider.open(JettonWallet.createFromConfig({
           balance:toNano("20"),
            owner_address:owner.address,
            jetton_master_address:jetton_master.address,
            jetton_wallet_code:await compile("JettonWallet")
    }, await compile('JettonWallet')));

    await jettonWallet.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(jettonWallet.address);

    // run methods on `jettonWallet`
}
