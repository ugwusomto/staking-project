import { CryptoAddressService } from "../crypto-address/crypto-address.service";
import { inject, injectable } from "tsyringe";
import { BalanceRepository } from "./balance.repository";
import { IRPCResponse } from "../../interface/index.interface";
import { CurrencyRepository } from "../currency/currency.repository";
import { TransactionRepository } from "../transaction/transaction.repository";
import {
  TRANSACTION_MODE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../transaction/transaction.config";
import { QUEUE_NAMES } from "./queues/balance.config.queue";
import BalanceQueueProducer from "./queues/balance-producer.queue";
@injectable()
export class BalanceService {
  private balanceQueue: BalanceQueueProducer =
    BalanceQueueProducer.getInstance();
  constructor(
    @inject(BalanceRepository)
    private readonly balanceRepository: BalanceRepository,
    @inject(CryptoAddressService)
    private readonly cryptoAddressService: CryptoAddressService,
    @inject(CurrencyRepository)
    private readonly currencyRepository: CurrencyRepository,
    @inject(TransactionRepository)
    private readonly transactionRepository: TransactionRepository
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

      console.log(
        "Created balance and address:",
        balance,
        addressResult.data.cryptoAddress
      );

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
    param: { amount: number; currency: string; destinationAddress: string }
  ): Promise<IRPCResponse> {
    try {
      const { amount, currency: currencyId, destinationAddress } = param;
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
      if (balance.amount < amount) {
        return { status: false, message: "Insufficient funds." };
      }

      // use transaction here in a real db
      this.balanceRepository.lockAmount(userId, currencyId, amount);
      const transaction = this.transactionRepository.create({
        userId,
        currencyId,
        type: TRANSACTION_TYPE.WITHDRAW,
        amount: amount,
        mode: TRANSACTION_MODE.CRYPTO_WITHDRAW,
        status: TRANSACTION_STATUS.PENDING,
        desitinationAddress: destinationAddress,
      });

      console.log(
        "About to add to queue for withdrawal processing:",
        transaction
      );
      // lock the balance and queue
      await this.balanceQueue.addJob<{ transactionId: string }>(
        QUEUE_NAMES.CRYPTO_WITHDRAWAL_QUEUE,
        {
          transactionId: transaction.id,
        }
      );

      return {
        status: true,
        message: "Withdrawal initiated successfully.",
        data: { transaction: transaction },
      };
    } catch (error) {
      console.error("Error in withdraw:", error);
      return {
        status: false,
        message: "Failed to process withdrawal.",
      };
    }
  }

  lockBalanceForStaking(
    userId: string,
    currencyId: string,
    amount: number
  ): IRPCResponse {
    try {
      const balance = this.balanceRepository.findByUserIdAndCurrencyId(
        userId,
        currencyId
      );
      if (!balance) {
        return { status: false, message: "Balance not found." };
      }
      if (balance.amount < amount) {
        return { status: false, message: "Insufficient funds." };
      }

      // Lock the balance
      this.balanceRepository.lockAmount(userId, currencyId, amount);

      // Create a transaction record
      const transaction = this.transactionRepository.create({
        userId,
        currencyId,
        type: TRANSACTION_TYPE.WITHDRAW,
        amount: amount,
        mode: TRANSACTION_MODE.STAKE,
        status: TRANSACTION_STATUS.PENDING,
        desitinationAddress: null,
      });

      return {
        status: true,
        message: "Balance locked for staking successfully.",
        data: { transaction: transaction },
      };
    } catch (error) {
      console.error("Error locking balance for staking:", error);
      return {
        status: false,
        message: "Failed to lock balance for staking.",
      };
    }
  }
}
