import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type AirdrophelperConfig = {};

export function airdrophelperConfigToCell(config: AirdrophelperConfig): Cell {
    return beginCell().endCell();
}

export class Airdrophelper implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Airdrophelper(address);
    }

    static createFromConfig(config: AirdrophelperConfig, code: Cell, workchain = 0) {
        const data = airdrophelperConfigToCell(config);
        const init = { code, data };
        return new Airdrophelper(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
