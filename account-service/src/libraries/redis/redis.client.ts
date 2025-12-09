import Redis from "ioredis";
import { singleton } from "tsyringe";

@singleton()
class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      });
      RedisClient.instance.on("error", (err) => {
        console.error("Redis connection error:", err);
      });

      RedisClient.instance.on("connect", () => {
        console.log("Connected to Redis successfully.");
      });
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
