import { container } from "tsyringe";
import { VaultService } from "./vault/vault.service";


export const registerModuleServices = (): {
  vaultService: VaultService;
} => {
  const vaultService = container.resolve(VaultService);
  return { vaultService };
};
