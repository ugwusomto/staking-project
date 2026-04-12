import Redis from "ioredis";
import { Queue } from "bullmq";
import { singleton } from "tsyringe";
import RedisClient from "../../../libraries/redis/redis.client";
import { QUEUE_NAMES } from "./balance.config.queue";

@singleton()
class BalanceQueueProducer {
  private connection: Redis;

  public cryptoAddressQueue: Queue;

  private static instance: BalanceQueueProducer;

  constructor() {
    this.connection = RedisClient.getInstance().duplicate();
    this.cryptoAddressQueue = new Queue(QUEUE_NAMES.CRYPTO_WITHDRAWAL_QUEUE, {
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

  public static getInstance(): BalanceQueueProducer {
    if (!BalanceQueueProducer.instance) {
      BalanceQueueProducer.instance = new BalanceQueueProducer();
    }
    return BalanceQueueProducer.instance;
  }

  public async addJob<T>(name: string, data: T): Promise<void> {
    await this.cryptoAddressQueue.add(name, data);
  }

  public async closeConnection(): Promise<void> {
    await this.cryptoAddressQueue.close();
  }
}

export default BalanceQueueProducer;
