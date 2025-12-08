import { container } from "tsyringe";
import { BalanceService } from "./balance/balance.service";
import { CryptoAddressService } from "./crypto-address/crypto-address.service";
import { AuthenticationService } from "./authentication/authentication.service";

export const registerModuleServices = (): {
  balanceService: BalanceService;
  cryptoAddressService: CryptoAddressService;
    authenticationService: AuthenticationService;
} => {
  const balanceService = container.resolve(BalanceService);
  const cryptoAddressService = container.resolve(CryptoAddressService);
  const authenticationService = container.resolve(AuthenticationService);

  return { balanceService, cryptoAddressService, authenticationService };
};
