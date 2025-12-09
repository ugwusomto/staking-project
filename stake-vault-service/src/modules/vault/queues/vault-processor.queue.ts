import { inject, injectable, singleton } from "tsyringe";
import { JOB_PARAMS } from "../vault.interface";

@singleton()
class VaultQueueProcessor {
  constructor() // @inject(Web3Service)
  // private readonly web3Service: Web3Service,
  // @inject(CurrencyRepository)
  // private readonly currencyRepository: CurrencyRepository,
  // @inject(VaultRepository)
  // private readonly balanceRepository: VaultRepository
  {}

  public async processSmartContractActions(params: JOB_PARAMS): Promise<void> {
    const { transactionId, action } = params;

    console.log(
      `Processing action: ${action} for transaction ID: ${transactionId}`
    );
    // console.log(
    //   `Processing on-chain withdrawal for transaction ID: ${transactionId}`
    // );

    // const transaction = this.transactionRepository.findById(transactionId);

    // if (!transaction) {
    //   console.error(`Transaction with ID ${transactionId} not found.`);
    //   return;
    // }

    // if (transaction.status !== TRANSACTION_STATUS.PENDING) {
    //   console.warn(
    //     `Transaction with ID ${transactionId} is not in PENDING status. Current status: ${transaction.status}`
    //   );
    //   return;
    // }

    // const currency = this.currencyRepository.findByCurrencyId(
    //   transaction.currencyId
    // );
    // if (!currency) {
    //   console.error(`Currency with ID ${transaction.currencyId} not found.`);
    //   return;
    // }
    // const { amount, desitinationAddress } = transaction;

    // const result = await this.web3Service.sendToken(
    //   amount,
    //   desitinationAddress,
    //   currency.chainId.toString(),
    //   currency.isNative,
    //   currency.decimals
    // );

    // if (!result) {
    //   this.transactionRepository.updateStatus(
    //     transactionId,
    //     TRANSACTION_STATUS.REVERSED
    //   );

    //   this.balanceRepository.reverseLockAmount(
    //     transaction.userId,
    //     transaction.currencyId,
    //     transaction.amount
    //   );
    //   console.error(
    //     `Failed to process on-chain withdrawal for transaction ID: ${transactionId}`
    //   );
    //   return;
    // } else {
    //   this.transactionRepository.updateStatus(
    //     transactionId,
    //     TRANSACTION_STATUS.COMPLETED
    //   );
    //   this.balanceRepository.deductLockedAmount(
    //     transaction.userId,
    //     transaction.currencyId,
    //     transaction.amount
    //   );
    // }

    // notify user
  }
}

export default VaultQueueProcessor;
