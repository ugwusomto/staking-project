export const WEB3_RPC: Record<string, string[]> = {
  "84532": process.env.WEB3_RPC_84532 ? process.env.WEB3_RPC_84532.split(",") : [],
};
