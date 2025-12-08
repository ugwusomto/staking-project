import { PeerRPCClient } from "grenache-nodejs-http";
const Link = require("grenache-nodejs-link");

const link = new Link({ grape: "http://127.0.0.1:30001" });
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

const payload = { action: "registerUser", userId: "user123", currency: "ETH" };

peer.request(
  "account_service", // the service key announced by the server
  payload,
  { timeout: 10000 },
  (err, data) => {
    if (err) return console.error(err);
    console.log("Response:", data);
  }
);
