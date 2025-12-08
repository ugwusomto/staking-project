import { CryptoAddressService } from "../crypto-address/crypto-address.service";
import { inject, injectable } from "tsyringe";
import { BalanceRepository } from "./balance.repository";
import { IRPCResponse } from "../../interface/index.interface";
import { CurrencyRepository } from "../currency/currency.repository";
@injectable()
export class BalanceService {
  constructor(
    @inject(BalanceRepository)
    private readonly balanceRepository: BalanceRepository,
    @inject(CryptoAddressService)
    private readonly cryptoAddressService: CryptoAddressService,
    @inject(CurrencyRepository)
    private readonly currencyRepository: CurrencyRepository
  ) {}

  createBalance(userId: string, currencyId: string): IRPCResponse {
    try {
      const currency = this.currencyRepository.findByCurrencyId(currencyId);
      if (!currency) {
        return {
          status: false,
          message: "Currency not found.",
        };
      }
      // Check if balance already exists
      const existingBalance = this.balanceRepository.findByUserIdAndCurrencyId(
        userId,
        currencyId
      );
      if (existingBalance) {
        return {
          status: false,
          message: "Balance already exists for this user and currency.",
        };
      }

      // Create balance
      const balance = this.balanceRepository.createBalance(userId, currencyId);

      // Create crypto address for the user on this currency
      const addressResult = this.cryptoAddressService.createCryptoAddress(
        userId,
        currencyId
      );
      if (!addressResult.status) {
        throw new Error("Failed to create crypto address.");
      }

      console.log("Created balance and address:", balance, addressResult.data.cryptoAddress);

      return {
        status: true,
        message: "Balance created successfully.",
        data: { balance, cryptoAddress: addressResult.data.cryptoAddress },
      };
    } catch (error) {
      console.error("Error creating balance and wallet:", error);
      return {
        status: false,
        message: "Failed to create balance and wallet.",
      };
    }
  }

  getBalance(userId: string, param: { currency: string }): IRPCResponse {
    const currencyId = param.currency;
    const currency = this.currencyRepository.findByCurrencyId(currencyId);
    if (!currency) {
      return {
        status: false,
        message: "Currency not found.",
      };
    }
    let balance = this.balanceRepository.findByUserIdAndCurrencyId(
      userId,
      currencyId
    );
    if (!balance) {
      const result = this.createBalance(userId, currencyId);
      balance = result.data.balance;
    }
    return { status: true, message: "Balance found.", data: balance };
  }

  async withdraw(
    userId: string,
    param: { amount: number; currencyId: string; destinationAddress: string }
  ) {
    try {
      const { amount, currencyId, destinationAddress } = param;
      const currency = this.currencyRepository.findByCurrencyId(currencyId);
      if (!currency) {
        return {
          status: false,
          message: "Currency not found.",
        };
      }
      const balance = this.balanceRepository.findByUserIdAndCurrencyId(
        userId,
        currencyId
      );
      if (!balance) {
        return { status: false, message: "Balance not found." };
      }
      // if (balance.amount < amount) {
      //   return { status: false, message: "Insufficient funds." };
      // }
      // balance.amount -= amount;
      // await this.balanceRepository.save(balance);
      return { status: true, data: balance };
    } catch (error) {
      console.error("Error in withdraw:", error);
      return {
        status: false,
        message: "Failed to process withdrawal.",
      };
    }
  }
}
