import { BigNumberish, ethers } from "ethers";
import { injectable, singleton } from "tsyringe";
import { WEB3_RPC } from "./web3.config";
import { IGetContractInstance } from "./web3.interface";

@singleton()
export class Web3Service {
  async sendToken(
    amount: number,
    toAddress: string,
    chainId: string,
    isNative: boolean,
    decimal?: number
  ): Promise<string | null> {
    try {
      if (!isNative) {
        console.log("only native token transfer is supported in this version");
        return null;
      }

      if (!this.isAddressValid(toAddress, false)) {
        console.error("Invalid destination address");
        return null;
      }

      // Send native token (e.g., ETH)
      const wallet = await this.getSignerWallet(chainId);
      const balance = this.weiToToken(await wallet.provider.getBalance(wallet.address), decimal);
      if(balance < amount) {
        console.error("Insufficient balance in the wallet");
        return null;
      }
      const tx = {
        to: toAddress,
        value: this.tokenToWei(amount, decimal),
      };
      const sentTx = await wallet.sendTransaction(tx);
      const receipt = await sentTx.wait(2);
      console.log("Transaction successful with hash:", receipt.hash);
      return receipt.hash;
    } catch (err) {
      console.error("Error sending token:", err);
      return null;
    }
  }

  private async getSignerWallet(chainId: string): Promise<ethers.HDNodeWallet> {
    const WEB3_RPC = process.env.WEB3_RPC_84532;
    const provider = await this.getConnectedProvider([WEB3_RPC]);
    const wallet = ethers.Wallet.fromPhrase(
      process.env.MASTER_MNEMONIC,
      provider
    );
    return wallet;
  }

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

  private async getConnectedProvider(
    rpc: string[]
  ): Promise<ethers.JsonRpcProvider> {
    console.log("Attempting to connect to RPC URLs:", rpc);
    let lastError: any = null;
    for (const rpcUrl of rpc) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await provider.getNetwork();
        return provider;
      } catch (err) {
        lastError = err;
        continue;
      }
    }
  }
}
