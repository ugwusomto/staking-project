import { BigNumberish, ethers } from "ethers";
import { singleton } from "tsyringe";
import {
  ERC20_CONTRACT,
  IGetContractInstance,
  STAKING_VAULT_CONTRACT,
} from "./web3.interface";
import {
  ERC20_ABI,
  STAKING_SMART_CONTRACT_ABI,
} from "./constant/web3-abi.constant";

@singleton()
export class Web3Service {
  private weiToToken(data: BigNumberish, decimal?: number): number {
    return parseFloat(ethers.formatUnits(data, decimal || 18));
  }

  private isAddressValid(
    address: string,
    allowZeroAddress: boolean = true
  ): boolean {
    if (!ethers.isAddress(address)) {
      return false;
    }

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    if (!allowZeroAddress && address.toLowerCase() === zeroAddress) {
      return false;
    }

    return true;
  }

  private tokenToWei(data: number, decimal?: number): bigint {
    const precision = decimal || 18;
    const fixed = Number(data).toFixed(precision);
    return ethers.parseUnits(fixed, precision);
  }

  private async getContractInstance<T>(body: IGetContractInstance): Promise<T> {
    const { contractAddress, abi } = body;
    let lastError: any = null;
    const seedPhrase = process.env.MASTER_MNEMONIC;
    const rpcs = process.env.RPC_URLS.split(",");

    for (const rpcUrl of rpcs) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await provider.getNetwork(); // verifies RPC connection

        // Create wallet from mnemonic (seed phrase)
        const wallet = ethers.Wallet.fromPhrase(seedPhrase).connect(provider);

        // Create contract with signer
        const contract = new ethers.Contract(
          contractAddress,
          JSON.parse(abi),
          wallet
        );

        return contract as T;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    throw new Error(
      `All RPC connections failed: ${lastError?.message || lastError}`
    );
  }

  private getAddressFromSeedPhrase(): string {
    const seedPhrase = process.env.MASTER_MNEMONIC!;
    const wallet = ethers.Wallet.fromPhrase(seedPhrase);
    return wallet.address;
  }

  async stakeTokenAmount(amount: number): Promise<string | null> {
    try {
      const stakeingVaultContract =
        await this.getContractInstance<STAKING_VAULT_CONTRACT>({
          contractAddress: process.env.STAKING_VAULT_CONTRACT_ADDRESS!,
          abi: JSON.stringify(STAKING_SMART_CONTRACT_ABI),
        });

      const erc20ContractInstance =
        await this.getContractInstance<ERC20_CONTRACT>({
          contractAddress: process.env.ERC20_CONTRACT_ADDRESS!,
          abi: JSON.stringify(ERC20_ABI),
        });

      const masterWalletAddress = this.getAddressFromSeedPhrase();
      const availableBalance = this.weiToToken(
        await erc20ContractInstance.balanceOf(masterWalletAddress)
      );

      console.log("Available token balance for staking:", masterWalletAddress, availableBalance);

      if (availableBalance < amount) {
        console.error("Insufficient token balance for staking.");
        return null;
      }
      

      const allowance = this.weiToToken(
        await erc20ContractInstance.allowance(
          masterWalletAddress,
          process.env.STAKING_VAULT_CONTRACT_ADDRESS!
        )
      );

      if (allowance < amount) {
        const approveTx = await erc20ContractInstance.approve(
          process.env.STAKING_VAULT_CONTRACT_ADDRESS!,
          this.tokenToWei(amount)
        );

        await approveTx.wait();
        if (!approveTx) {
          console.error("Token approval failed.");
          return null;
        }
      }

      const depositTx = await stakeingVaultContract.deposit(
        this.tokenToWei(amount),
        masterWalletAddress
      );

      await depositTx.wait();

      return depositTx.hash;
    } catch (error) {
      console.error("Error in stakeTokenAmount:", error);
      return null;
    }
  }
}
