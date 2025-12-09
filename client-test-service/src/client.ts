import { PeerRPCClient } from "grenache-nodejs-http";
import { ACTIONS } from "./actions/index.actions";
const Link = require("grenache-nodejs-link");

const link = new Link({ grape: "http://127.0.0.1:30001" });
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

// peer.request(
//   "account_service", // the service key announced by the server
//   {
//     action: ACTIONS.LOGIN_USER,
//     data: {
//       email: "test@gmail.com",
//       password: "password123",
//     },
//   },
//   { timeout: 10000 },
//   (err, data) => {
//     if (err) return console.error(err);

//     console.log("Response:", data);
//   }
// );

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMmIzMzMzLTExMTEtMjIyMi0zMzMzLWFiY2RlZjEyMzQ1NiIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE3NjUyMTQyMjIsImV4cCI6MTc2NTMwMDYyMn0.Go45GF3jaW-nP1UTpV_mc5gAxibIN0R8QCowhsKocHI";

// Get Balance
peer.request(
  "account_service", // the service key announced by the server
  {
    action: ACTIONS.GET_BALANCE,
    data: {
      currency: "1a2b3c4d-1111-2222-3333-abcdef123452",
    },
    token: authToken,
  },
  { timeout: 10000 },
  (err, data) => {
    if (err) return console.error(err);

    console.log("Response:", data);
  }
);

// Get Deposit addresses
peer.request(
  "account_service", // the service key announced by the server
  {
    action: ACTIONS.GET_DEPOSIT_ADDRESSES,
    data: {
      currency: "1a2b3c4d-1111-2222-3333-abcdef123452",
    },
    token: authToken,
  },
  { timeout: 10000 },
  (err, data) => {
    if (err) return console.error(err);

    console.log("Response:", data);
  }
);










// Get Deposit addresses
// peer.request(
//   "account_service", // the service key announced by the server
//   {
//     action: ACTIONS.WITHDRAW,
//     data: {
//       currency: "1a2b3c4d-1111-2222-3333-abcdef123452",
//       amount: 0.001,
//       destinationAddress: "0xe06974688b6ba8718caed90443111ed4679023b6",
//     },
//     token: authToken,
//   },
//   { timeout: 10000 },
//   (err, data) => {
//     if (err) return console.error(err);

//     console.log("Response:", data);
//   }
// );
