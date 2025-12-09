import { container } from "tsyringe";
import { VaultService } from "./vault/vault.service";
import VaultQueueConsumer from "./vault/queues/vault-consumer.queue";


export const registerModuleServices = (): {
  vaultService: VaultService;
} => {
  const vaultQueueConsumer = container.resolve(VaultQueueConsumer);
  vaultQueueConsumer.init();
  const vaultService = container.resolve(VaultService);
  return { vaultService };
};
