export const PUBLIC_ACTIONS = [];

export enum ACTIONS {
  GET_BALANCE = "getBalance",
  WITHDRAW = "withdraw",
  GET_DEPOSIT_ADDRESSES = "getDepositAddress",

  DEPOSIT_TO_VAULT = "depositToVault",
  WITHDRAW_FROM_VAULT = "withdrawFromVault",
  REQUEST_WITHDRAWAL_FROM_VAULT = "requestWithdrawalFromVault",
  INITIATE_STAKING = "initiateStaking",
  GET_TRANSACTION = "getTransactionInfo",

  COMPLETE_STAKE_AND_UNSTAKE = "completeStakeAndUnstake",
}
