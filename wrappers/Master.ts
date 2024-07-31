import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type MasterConfig = {
    admin_address:Address,
    jetton_wallet_code:Cell
};

export function masterConfigToCell(config: MasterConfig): Cell {
    return beginCell()
    .storeCoins(0)
    .storeAddress(config.admin_address)
    .storeRef(beginCell().endCell())
    .storeRef(config.jetton_wallet_code)
    .endCell();
}

export class Master implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Master(address);
    }

    static createFromConfig(config: MasterConfig, code: Cell, workchain = 0) {
        const data = masterConfigToCell(config);
        const init = { code, data };
        return new Master(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(provider:ContractProvider,via:Sender, Opt:{
        value: bigint,
        toAddress: Address,
        amount: bigint,
        jettonAmount: bigint,
    }){
        await provider.internal(via,{
            value:Opt.value,
            sendMode:SendMode.PAY_GAS_SEPARATELY,
            body:beginCell()
            .storeUint(21, 32)
            .storeUint(0, 64)
            .storeAddress(Opt.toAddress)
            .storeCoins(Opt.amount)
            .storeRef(
                beginCell()
                    .storeUint(0x178d4519, 32)
                    .storeUint(0, 64)
                    .storeCoins(Opt.jettonAmount)
                    .storeAddress(this.address)
                    .storeAddress(this.address)
                    .storeCoins(0)
                    .storeUint(0, 1)
                .endCell()
            ).endCell()
        })
    }


    async getTotalSupply(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('get_jetton_data', []);
        // console.log(result.stack);
        return result.stack.readBigNumber();
    }
}

