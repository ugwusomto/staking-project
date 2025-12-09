import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { PeerRPCServer } from "grenache-nodejs-http";
import { RPCPayload } from "./interface/index.interface";
import { registerModuleServices } from "./modules/app.module";
import { authMiddleware } from "./middleware/index.middleware";
import { ACTIONS } from "./actions/index.actions";
const Link = require("grenache-nodejs-link");

// Create Grenache link and peer
const grapeHost = process.env.GRAPE_HOST as string;
const serviceName = process.env.SERVICE_NAME as string;

if (!grapeHost || !serviceName) {
  console.error(
    "Missing required environment variables: GRAPE_HOST or SERVICE_NAME"
  );
  process.exit(1);
}

const link = new Link({ grape: grapeHost });
link.start();

const peer = new PeerRPCServer(link, { timeout: 300000 });
peer.init();

const port =
  Number(process.env.PORT) || 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport("server");
service.listen(port);

// Announce this service to the DHT
setInterval(() => {
  // console.log(`Announcing service ${serviceName} on port ${service.port}`);
  link.announce(serviceName, service.port, {});
}, 1000);

// Register module services
const { balanceService, cryptoAddressService, authenticationService } =
  registerModuleServices();

// Handle incoming RPC requests
service.on(
  "request",
  async (rid: string, key: string, payload: RPCPayload, handler: any) => {
    // console.log("Payload received in server:", payload);
    authMiddleware(payload, handler, async (validatedPayload) => {
      try {
        const userId = validatedPayload.user?.id;
        const payloadData = validatedPayload.data;
        // Example routing based on 'key' in payload
        switch (validatedPayload.action) {
          case ACTIONS.LOGIN_USER:
            return handler.reply(
              null,
              authenticationService.loginUser(payloadData)
            );
          case ACTIONS.GET_BALANCE:
            return handler.reply(
              null,
              balanceService.getBalance(userId, payloadData)
            );
          case ACTIONS.WITHDRAW:
            return handler.reply(
              null,
              await balanceService.withdraw(userId, payloadData)
            );

          case ACTIONS.GET_DEPOSIT_ADDRESSES:
            return handler.reply(
              null,
              cryptoAddressService.getDepositAddress(
                userId,
                payloadData.currency
              )
            );
          default:
            return handler.reply(new Error("Unknown method"));
        }
      } catch (err) {
        return handler.reply(err as Error);
      }
    });
    console.log(`Received request for key: ${key} with payload:`);
  }
);

console.log(`Account Service is running as Grenache RPC node on port ${port}`);
