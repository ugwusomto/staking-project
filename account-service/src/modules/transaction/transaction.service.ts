import { inject, injectable } from "tsyringe";
import { TransactionRepository } from "./transaction.repository";
import { IRPCResponse } from "../../interface/index.interface";


@injectable()
export class TransactionService {

  constructor(
    @inject(TransactionRepository)
    private readonly transactionRepository: TransactionRepository
  ) {}

  getTransactionById(transactionId: string): IRPCResponse {
    const transaction = this.transactionRepository.findById(transactionId);
    return {
      status: true,
      message: "Transaction retrieved successfully.",
      data: transaction,
    };
  }
}
