import { TRANSACTION_MODE, TRANSACTION_STATUS, TRANSACTION_TYPE } from "./transaction.config";

export interface ITransaction {
  id: string;
  userId: string;
  currencyId: string;
  type: TRANSACTION_TYPE;
  amount: number; // stored as string because of decimal precision
  mode: TRANSACTION_MODE;
  status: TRANSACTION_STATUS;
  desitinationAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
