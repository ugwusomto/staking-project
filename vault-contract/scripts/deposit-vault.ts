import { network } from "hardhat";

const { ethers, networkName } = await network.connect();
async function main() {
  const VAULT_ADDRESS = "0x0133Da25a972B3d23e476f70bAd2C10E449ea580";
  const ASSET_ADDRESS = "0xDe44F2737876eed59FC5679E214544797F12cfb0";
  const AMOUNT = "1000"; // human units of asset
  const RECEIVER = process.env.RECEIVER; // optional; defaults to signer

  if (!VAULT_ADDRESS || !ethers.isAddress(VAULT_ADDRESS)) {
    throw new Error(
      "VAULT_ADDRESS env var is required and must be a valid address"
    );
  }
  if (!ASSET_ADDRESS || !ethers.isAddress(ASSET_ADDRESS)) {
    throw new Error(
      "ASSET_ADDRESS env var is required and must be a valid address"
    );
  }

  const [signer] = await ethers.getSigners();
  const receiver =
    RECEIVER && ethers.isAddress(RECEIVER)
      ? RECEIVER
      : await signer.getAddress();

  const asset = await ethers.getContractAt("Eth", ASSET_ADDRESS);
  const decimals = await asset.decimals();
  const amountWei = ethers.parseUnits(AMOUNT, decimals);

  const allowance = await asset.allowance(
    await signer.getAddress(),
    VAULT_ADDRESS
  );
  if (allowance < amountWei) {
    const approveTx = await asset.approve(VAULT_ADDRESS, amountWei);
    console.log("Approve tx:", approveTx.hash);
    await approveTx.wait();
  }

  const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);
  const depositTx = await vault.deposit(amountWei, receiver);
  console.log("Deposit tx:", depositTx.hash);
  const sharesMinted = await depositTx.wait().then((r) => r?.status);
  console.log(`Deposited ${AMOUNT} assets into Vault for ${receiver}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
