import { singleton } from "tsyringe";
import { Currency } from "./currency.interface";

@singleton()
export class CurrencyRepository {
  private readonly currencies: Currency[] = [
    {
      id: "1a2b3c4d-1111-2222-3333-abcdef123452",
      name: "Ethereum",
      symbol: "ETH",
      chainId: 84532,
      decimals: 18,
      isNative: true,
    },
    {
      id: "2bcb3c4d-1111-2222-3333-abcdef123451",
      name: "USDT",
      symbol: "USDT",
      chainId: 1,
      decimals: 6,
      isNative: false,
    },
    {
      id: "3cdb3c4d-1111-2222-3333-abcdef123453",
      name: "USDC",
      symbol: "USDC",
      chainId: 1,
      decimals: 6,
      isNative: false,
    },
  ];

  getAllCurrencies(): Currency[] {
    return this.currencies;
  }

  findByCurrencyId(currencyId: string): Currency | null {
    const currency = this.currencies.find((c) => c.id === currencyId);
    return currency || null;
  }
}
