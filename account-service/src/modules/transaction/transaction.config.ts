export enum TRANSACTION_STATUS {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REVERSED = "reversed",

}

export enum TRANSACTION_TYPE {
  WITHDRAW = "withdraw",
  DEPOSIT = "deposit",
}

export enum TRANSACTION_MODE {
    CRYPTO_DEPOSIT = "crypto_deposit",
    CRYPTO_WITHDRAW = "crypto_withdraw",
    STAKE = "stake",
    UNSTAKE = "unstake",
}