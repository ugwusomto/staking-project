import { network } from "hardhat";

const { ethers, networkName } = await network.connect();

async function main() {
  const VAULT_ADDRESS = "0x0133Da25a972B3d23e476f70bAd2C10E449ea580";
  const ASSETS = "50"; // human units of underlying assets to withdraw
  const RECEIVER = process.env.RECEIVER; // optional; defaults to signer
  const OWNER = process.env.OWNER; // optional; defaults to signer

  if (!VAULT_ADDRESS || !ethers.isAddress(VAULT_ADDRESS)) {
    throw new Error(
      "VAULT_ADDRESS env var is required and must be a valid address"
    );
  }

  const [signer] = await ethers.getSigners();
  const signerAddr = await signer.getAddress();
  const receiver =
    RECEIVER && ethers.isAddress(RECEIVER) ? RECEIVER : signerAddr;
  const owner = OWNER && ethers.isAddress(OWNER) ? OWNER : signerAddr;

  const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);
  const assetAddr = await vault.asset();
  const asset = await ethers.getContractAt("Eth", assetAddr);
  const decimals = await asset.decimals();
  const assetsWei = ethers.parseUnits(ASSETS, decimals);

  // If msg.sender != owner, ensure allowance is set for vault to burn owner's shares
  if (signerAddr.toLowerCase() !== owner.toLowerCase()) {
    const sharesAddr = VAULT_ADDRESS; // shares token is the Vault itself (ERC20)
    const shares = await ethers.getContractAt("Eth", sharesAddr);
    const allowance = await shares.allowance(owner, signerAddr);
    if (allowance < assetsWei) {
      throw new Error(
        "Allowance from owner to msg.sender insufficient for burn-based withdraw. Set allowance or call as owner."
      );
    }
  }

  const tx = await vault.withdraw(assetsWei, receiver, owner);
  console.log("Withdraw tx:", tx.hash);
  await tx.wait();
  console.log(`Withdrew ${ASSETS} assets to ${receiver}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
