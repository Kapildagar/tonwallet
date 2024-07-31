import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItemSlice } from '@ton/core';

export type JettonWalletConfig = {
       balance:bigint
      owner_address:Address,
      jetton_master_address:Address,
      jetton_wallet_code:Cell
};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell()
    .storeCoins(config.balance)
    .storeAddress(config.owner_address)
    .storeAddress(config.jetton_master_address)
    .storeRef(config.jetton_wallet_code)
    .endCell();
}

export class JettonWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = jettonWalletConfigToCell(config);
        const init = { code, data };
        return new JettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfertoken(provider:ContractProvider, via :Sender,opt:{
       value:bigint
       recipient:Address,
       forwardValue:bigint,
       amount:bigint
    }){
      await provider.internal(via,{
        value:opt.value,
        sendMode:SendMode.PAY_GAS_SEPARATELY,
        body:beginCell()
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(opt.amount)
        .storeAddress(opt.recipient)
        .storeAddress(via.address)
        .storeUint(0, 1)
        .storeCoins(opt.forwardValue)
       .storeUint(1, 1)
        //.storeRef(forwardPayload)
        .endCell(),
      })
    }
   

     async sendBurns(provider:ContractProvider , via:Sender,opt:{
            value:bigint,
            amount:bigint,
            forwardValue:bigint
     }){
        await provider.internal(via,{
            value:opt.value,
            sendMode:SendMode.PAY_GAS_SEPARATELY,
            body:beginCell()
                    .storeUint(0x595f07bc ,32)
                    .storeUint(0,64)
                    .storeCoins(opt.amount)
                    .storeAddress(via.address)
                    // .storeUint(0, 1)
                    // .storeCoins(opt.forwardValue)
                    // .storeUint(1, 1)
                    .endCell()
        }
        )
     }

    async getWalletData(provider:ContractProvider){
       const result = await provider.get("get_wallet_data",[]);
       console.log(result.stack.readBigNumber())
    }

    async getAddress(provider:ContractProvider,owner_address:Address){
        const result = await provider.get("get_address",[ {
            type: 'slice',
            cell: beginCell().storeAddress(owner_address).endCell()
        } as TupleItemSlice]);
        console.log(result.stack.readAddress())
    
     }

     

    
}
