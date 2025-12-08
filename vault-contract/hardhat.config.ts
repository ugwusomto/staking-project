import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const sepoliaUrl = process.env.SEPOLIA_RPC_URL!;
const privateKey = process.env.PRIVATE_KEY!;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },

      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: sepoliaUrl,
      accounts: [privateKey],
    },
    binance: {
      type: "http",
      chainType: "l1",
      url: "https://bsc-dataseed.binance.org/",
      // No accounts provided for read-only access
    },
  },
  verify: {
    etherscan: {
      apiKey: etherscanApiKey,
    },
  },
});
