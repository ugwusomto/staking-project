import { TransactionResponse } from "ethers";
import { BaseContract } from "ethers/src.ts/contract/contract";

export interface IGetContractInstance{
    contractAddress: string,
    rpc: string[],
    abi: string,
}



export interface STAKING_VAULT_CONTRACT {
  deposit: (assets: bigint, receiver: string) => Promise<TransactionResponse>;
}

export interface ERC20_CONTRACT {
    balanceOf: (account: string) => Promise<bigint>;
    allowance: (owner: string, spender: string) => Promise<bigint>;
    approve: (spender: string, amount: bigint) => Promise<TransactionResponse>;
}

