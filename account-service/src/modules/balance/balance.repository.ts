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
      amount: 100,
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

  lockAmount(userId: string, currencyId: string, amount: number): boolean {
    const balance = this.balances.find((b) => b.userId === userId && b.currencyId === currencyId);
    if (!balance || balance.amount < amount) {
      return false;
    }
    balance.amount -= amount;
    balance.lockedAmount += amount;
    balance.updatedAt = new Date();
    return true;
  }

  reverseLockAmount(userId: string, currencyId: string, amount: number): boolean {
    const balance = this.balances.find((b) => b.userId === userId && b.currencyId === currencyId);
    if (!balance || balance.lockedAmount < amount) {
      return false;
    }
    balance.lockedAmount -= amount;
    balance.amount += amount;
    balance.updatedAt = new Date();
    return true;
  }

  deductLockedAmount(userId: string, currencyId: string, amount: number): boolean {
    const balance = this.balances.find((b) => b.userId === userId && b.currencyId === currencyId);
    if (!balance || balance.lockedAmount < amount) {
      return false;
    }
    balance.lockedAmount -= amount;
    balance.updatedAt = new Date();
    return true;
  }

  applyStakedAmount(userId: string, currencyId: string, amount: number): boolean {
    const balance = this.balances.find((b) => b.userId === userId && b.currencyId === currencyId);
    if (!balance) {
      return false;
    }
    balance.lockedAmount -= amount;
    balance.stakedBalance += amount;
    balance.updatedAt = new Date();
    return true;
  }
}
