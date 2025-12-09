import { network } from "hardhat";
import "dotenv/config";
const { ethers, networkName } = await network.connect();
async function main() {
  const VAULT_ADDRESS = "0x0133Da25a972B3d23e476f70bAd2C10E449ea580";
  const AMOUNT = "100"; // human units of underlying assets

  if (!VAULT_ADDRESS || !ethers.isAddress(VAULT_ADDRESS)) {
    throw new Error(
      "VAULT_ADDRESS env var is required and must be a valid address"
    );
  }

  const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);
  const assetAddr = await vault.asset();
  const asset = await ethers.getContractAt("Eth", assetAddr);
  const decimals = await asset.decimals();
  const amountWei = ethers.parseUnits(AMOUNT, decimals);

  const tx = await vault.requestWithdrawal(amountWei);
  console.log("RequestWithdrawal tx:", tx.hash);
  await tx.wait();
  console.log(`Requested withdrawal of up to ${AMOUNT} assets after timelock.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
