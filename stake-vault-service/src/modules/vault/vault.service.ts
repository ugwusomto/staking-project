import { inject, injectable } from "tsyringe";
import { IRPCResponse } from "../../interface/index.interface";
import { ACTIONS } from "../../actions/index.actions";
import { GrenacheClient } from "../../client/grenache-client";
import VaultQueueProducer from "./queues/vault-producer.queue";
import { QUEUE_NAMES } from "./queues/vault.config.queue";
import { JOB_PARAMS } from "./vault.interface";

@injectable()
export class VaultService {
  private vaultQueue: VaultQueueProducer = VaultQueueProducer.getInstance();

  constructor() {}

  async depositToVault(
    amount: number,
    currency: string,
    token: string
  ): Promise<IRPCResponse> {
    try {
      const {
        data: { amount: balance },
      } = await GrenacheClient.request({
        action: ACTIONS.GET_BALANCE,
        data: { currency },
        token,
      });

      if (balance < amount) {
        return {
          status: false,
          message: "Insufficient balance to deposit to vault.",
        };
      }

      const data = await GrenacheClient.request({
        action: ACTIONS.INITIATE_STAKING,
        data: { currency, amount },
        token,
      });

      if (!data.status) {
        return {
          status: false,
          message: "Failed to initiate staking transaction.",
        };
      }

      await this.vaultQueue.addJob<JOB_PARAMS>(
        QUEUE_NAMES.CRYPTO_STAKE_QUEUE,
        {
          transactionId: data.transaction.id,
          action: ACTIONS.DEPOSIT_TO_VAULT
        }
      );

      return {
        status: true,
        message: "Staking to vault initiated successfully.",
        data: data ?? null,
      };
    } catch (error) {
      console.error("Error staking to vault:", error);
      return {
        status: false,
        message: "Failed to stake to vault.",
      };
    }
  }
}
