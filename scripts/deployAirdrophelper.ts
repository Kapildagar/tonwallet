import { toNano } from '@ton/core';
import { Airdrophelper } from '../wrappers/Airdrophelper';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const airdrophelper = provider.open(Airdrophelper.createFromConfig({}, await compile('Airdrophelper')));

    await airdrophelper.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(airdrophelper.address);

    // run methods on `airdrophelper`
}
