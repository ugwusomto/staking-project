import { singleton } from "tsyringe";
import { CryptoAddress } from "./crypto-address.interface";
import { randomUUID } from "crypto";

@singleton()
export class CryptoAddressRepository {
  private addresses: CryptoAddress[] = [];

  create(userId: string, address: string, currencyId: string): CryptoAddress {
    const cryptoAddress: CryptoAddress = {
      id: randomUUID(),
      userId,
      address,
      currencyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.addresses.push(cryptoAddress);
    return cryptoAddress;
  }

  countAddress(): number {
    return this.addresses.length;
  }

   findByUserIdAndCurrency(
    userId: string,
    currencyId: string
  ): CryptoAddress | null {
    return (
      this.addresses.find(
        (addr) => addr.userId === userId && addr.currencyId === currencyId
      ) || null
    );
  }
}
