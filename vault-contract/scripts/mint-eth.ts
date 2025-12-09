import { network } from "hardhat";
import "dotenv/config";
const { ethers, networkName } = await network.connect();
// npx hardhat run scripts/mint-eth.ts  --network sepolia
async function main() {
  const EARN_ADDRESS = "0xDe44F2737876eed59FC5679E214544797F12cfb0";
  const TO_ADDRESS = process.env.WALLET_ADDRESS;
  const AMOUNT = "100000"; // human units (e.g., 100000 tokens)

  if (!EARN_ADDRESS || !ethers.isAddress(EARN_ADDRESS)) {
    throw new Error(
      "EARN_ADDRESS env var is required and must be a valid address"
    );
  }
  if (!TO_ADDRESS || !ethers.isAddress(TO_ADDRESS)) {
    throw new Error(
      "TO_ADDRESS env var is required and must be a valid address"
    );
  }

  const eth = await ethers.getContractAt("Eth", EARN_ADDRESS);
  const decimals = await eth.decimals();
  // Convert human amount to smallest units using token decimals
  const amountWei = ethers.parseUnits(AMOUNT, Number(decimals));

  const [signer] = await ethers.getSigners();
  const owner = await eth.owner();
  const signerAddr = await signer.getAddress();
  if (owner.toLowerCase() !== signerAddr.toLowerCase()) {
    throw new Error(
      "Mint requires owner account. Current signer is not the Eth owner."
    );
  }

  const tx = await eth.mint(TO_ADDRESS, amountWei);
  console.log("Mint tx sent:", tx.hash);
  await tx.wait();
  console.log(`Minted ${AMOUNT} tokens to ${TO_ADDRESS}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
