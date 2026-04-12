import { Worker } from "bullmq";
import { inject, singleton } from "tsyringe";
import { QUEUE_NAMES } from "./vault.config.queue";
import VaultQueueProcessor from "./vault-processor.queue";
import RedisClient from "../../../libraries/redis/redis.client";

@singleton()
class VaultQueueConsumer {
  private worker: Worker;

  constructor(
    @inject(VaultQueueProcessor)
    private readonly vaultQueueProcessor: VaultQueueProcessor
  ) {}

  async init(): Promise<void> {
    try {
      if (this.worker) {
        console.log("VaultQueueConsumer is already initialized.");
        return;
      }
      const connection = RedisClient.getInstance();
      this.worker = new Worker(
        QUEUE_NAMES.CRYPTO_STAKE_QUEUE,
        this.processJobs.bind(this),
        {
          connection: connection.duplicate({ maxRetriesPerRequest: null }),
          concurrency: 5,
        }
      );

      // register event handlers
      this.registerEvents();

      console.log(
        `BullMQ Worker started for queue: ${QUEUE_NAMES.CRYPTO_STAKE_QUEUE}`
      );
    } catch (error) {
      console.error("Error initializing VaultQueueConsumer:", error);
    }
  }

  async processJobs(job: any): Promise<void> {
    console.log(`[Job ${job.name}] Processing address: ${job.data.address}`);
    await this.vaultQueueProcessor.processSmartContractActions(
      job.data
    );
  }

  async registerEvents(): Promise<void> {
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} has been completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} has failed with error: ${err.message}`);
    });

    // Add a handler for graceful shutdown
    process.on("SIGTERM", this.close.bind(this));
    process.on("SIGINT", this.close.bind(this));
  }

  async close(): Promise<void> {
    await this.worker.close();
    console.log("Crypto stake queue has been shut down gracefully.");
    process.exit(0);
  }
}

export default VaultQueueConsumer;
