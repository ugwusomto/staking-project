import { EntityManager } from "typeorm";
import { CryptoAddressRepository } from "./crypto-address.repository";
import { ethers, Mnemonic } from "ethers";
import { inject, injectable } from "tsyringe";
import { IRPCResponse } from "../../interface/index.interface";

@injectable()
export class CryptoAddressService {
  private readonly BASE_PATH = process.env.BASE_PATH;

  constructor(
    @inject(CryptoAddressRepository)
    private readonly cryptoAddressRepository: CryptoAddressRepository
  ) {}

  private getMasterNode(): ethers.HDNodeWallet | null {
    try {
      const MASTER_MNEMONIC = process.env.MASTER_MNEMONIC;
      if (!MASTER_MNEMONIC) {
        throw new Error("MASTER_MNEMONIC not defined");
      }

      // Generate mnemonic instance
      const mnemonicInstance = Mnemonic.fromPhrase(MASTER_MNEMONIC);

      return ethers.HDNodeWallet.fromMnemonic(mnemonicInstance);
    } catch (error) {
      console.error("Error generating master node:", error);
      return null;
    }
  }

  private createWeb3CryptoAddress(): {
    address: string;
    privateKey: string;
  } | null {
    try {
      const masterNode = this.getMasterNode();
      if (!masterNode) {
        throw new Error("Failed to generate master node");
      }

      // Placeholder for actual Web3 address generation logic
      const totalAddresses = this.cryptoAddressRepository.countAddress();

      // Construct the derivation path
      const path = this.BASE_PATH + totalAddresses;

      // Derive the child wallet from the master node
      const childWallet = masterNode.derivePath(totalAddresses.toString());

      return {
        address: childWallet.address,
        privateKey: childWallet.privateKey,
      };
    } catch (error) {
      console.error("Error generating Web3 address:", error);
      return null;
    }
  }

  createCryptoAddress(userId: string, currencyId: string): IRPCResponse {
    try {
      // verify if address already exists for user
      const existingCryptoAddress =
        this.cryptoAddressRepository.findByUserIdAndCurrency(
          userId,
          currencyId
        );
      if (existingCryptoAddress) {
        return {
          status: false,
          message: "Crypto address already exists for this user.",
          data: { cryptoAddress: existingCryptoAddress },
        };
      }

      // Generate new Web3 crypto address
      const web3CryptoAddress = this.createWeb3CryptoAddress();
      if (!web3CryptoAddress) {
        throw new Error("Web3 crypto address generation failed");
      }

      const cryptoAddress = this.cryptoAddressRepository.create(
        userId,
        web3CryptoAddress.address,
        currencyId
      );
      return {
        status: true,
        message: "Crypto address created successfully.",
        data: { cryptoAddress },
      };
    } catch (error) {
      console.error("Error in createCryptoAddress:", error);
      return {
        status: false,
        message: "Failed to create crypto address.",
      };
    }
  }

  getDepositAddress(userId: string, currencyId: string): IRPCResponse {
    try {
      const cryptoAddress =
        this.cryptoAddressRepository.findByUserIdAndCurrency(
          userId,
          currencyId
        );
      if (!cryptoAddress) {
        return {
          status: false,
          message: "Crypto address not found for this user.",
        };
      }
      return {
        status: true,
        message: "Crypto address retrieved successfully.",
        data: { cryptoAddress },
      };
    } catch (error) {
      console.error("Error in getDepositAddress:", error);
      return {
        status: false,
        message: "Failed to retrieve crypto address.",
      };
    }
  }
}
