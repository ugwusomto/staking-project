import Redis from "ioredis";
import { Queue } from "bullmq";
import { singleton } from "tsyringe";
import RedisClient from "../../../libraries/redis/redis.client";
import { QUEUE_NAMES } from "./vault.config.queue";

@singleton()
class VaultQueueProducer {
  private connection: Redis;

  public vaultQueue: Queue;

  private static instance: VaultQueueProducer;

  constructor() {
    this.connection = RedisClient.getInstance().duplicate();
    this.vaultQueue = new Queue(QUEUE_NAMES.CRYPTO_STAKE_QUEUE, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    });
  }

  public static getInstance(): VaultQueueProducer {
    if (!VaultQueueProducer.instance) {
      VaultQueueProducer.instance = new VaultQueueProducer();
    }
    return VaultQueueProducer.instance;
  }

  public async addJob<T>(name: string, data: T): Promise<void> {
    await this.vaultQueue.add(name, data);
  }

  public async closeConnection(): Promise<void> {
    await this.vaultQueue.close();
  }
}

export default VaultQueueProducer;
