import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { PeerRPCServer } from "grenache-nodejs-http";
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

// Handle incoming RPC requests
service.on("request", async (rid:any, key:any, payload:any, handler:any) => {
  console.log(`Received request for key: ${key} with payload:`, payload);
  try {
    // Example routing based on 'key' in payload
    switch (payload.action) {
        case "registerUser":
          if (!payload.data) throw new Error("No user data provided");
          console.log("Registering user with data:", payload.data);
          // const registerResult = await authService.registerUser(payload.data);
          return handler.reply(null, { success: true, message: "User registered" });

      //   case "loginUser":
      //     if (!payload.data) throw new Error("No credentials provided");
      //     const loginResult = await authService.loginUser(payload.data);
      //     return handler.reply(null, loginResult);

      //   case "getUser":
      //     if (!payload.data?.userId) throw new Error("No userId provided");
      //     const user = await userService.getUserById(payload.data.userId);
      //     return handler.reply(null, user);

      default:
        return handler.reply(new Error("Unknown method"));
    }
  } catch (err) {
    return handler.reply(err as Error);
  }
});

console.log(`Account Service is running as Grenache RPC node on port ${port}`);
