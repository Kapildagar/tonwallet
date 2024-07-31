import { toNano } from '@ton/core';
import { Master } from '../wrappers/Master';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Blockchain } from '@ton/sandbox';

export async function run(provider: NetworkProvider) {
    const blockchain = await Blockchain.create();
    const admin_address = await blockchain.treasury("onwer_address");
    const code = await compile("JettonWallet")
    const master = provider.open(Master.createFromConfig({
        admin_address:admin_address.address,
        jetton_wallet_code:code
    }, await compile('Master')));

    await master.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(master.address);

    // run methods on `master`
}
