import { randomUUID } from "crypto";
import { TRANSACTION_STATUS } from "./transaction.config";
import { ITransaction } from "./transaction.interface";
import { singleton } from "tsyringe";

@singleton()
export class TransactionRepository {
  private transactions: ITransaction[] = [];

  create(
    data: Omit<ITransaction, "id" | "createdAt" | "updatedAt">
  ): ITransaction {
    const newRecord: ITransaction = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.transactions.push(newRecord);
    return newRecord;
  }

  findById(id: string): ITransaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  findByUser(userId: string): ITransaction[] {
    return this.transactions.filter((t) => t.userId === userId);
  }

  updateStatus(id: string, status: TRANSACTION_STATUS): ITransaction | null {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) return null;

    tx.status = status;
    tx.updatedAt = new Date();
    return tx;
  }

  getAll(): ITransaction[] {
    return this.transactions;
  }
}
