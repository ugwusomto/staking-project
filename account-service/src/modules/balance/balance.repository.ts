import { singleton } from "tsyringe";
import { randomUUID } from "crypto";
import { Balance } from "./balance.interface";

@singleton()
export class BalanceRepository {
  private balances: Balance[] = [];

   createBalance(userId: string, currencyId: string): Balance {
    const balance: Balance = {
      id: randomUUID(),
      userId,
      currencyId,
      amount: 0,
      stakedBalance: 0,
      lockedAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.balances.push(balance);
    return balance;
  }

   findByUserIdAndCurrencyId(userId: string , currencyId: string): Balance | null {
    const balance = this.balances.find((b) => b.userId === userId && b.currencyId === currencyId);
    return balance || null;
  }
}
