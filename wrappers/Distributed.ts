import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type DistributedConfig = {};

export function distributedConfigToCell(config: DistributedConfig): Cell {
    return beginCell().endCell();
}

export class Distributed implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Distributed(address);
    }

    static createFromConfig(config: DistributedConfig, code: Cell, workchain = 0) {
        const data = distributedConfigToCell(config);
        const init = { code, data };
        return new Distributed(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
