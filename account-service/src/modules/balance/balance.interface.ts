
export interface Balance {
  id: string;
  userId: string;
  currencyId: string;
  amount: number;
  stakedBalance: number;
  lockedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
