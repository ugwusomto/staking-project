import { inject, injectable } from "tsyringe";
import { IRPCResponse } from "../../interface/index.interface";
import { ACTIONS } from "../../actions/index.actions";
import { GrenacheClient } from "../../client/grenache-client";

@injectable()
export class VaultService {
  constructor() {}

  depositToVault(amount: number, currency: string): IRPCResponse {
    try {
      const result = GrenacheClient.request(ACTIONS.DEPOSIT_TO_VAULT, {
        currency,
      });
      console.log("Deposit to vault result:", result);
      return {
        status: true,
        message: "Deposit to vault initiated successfully.",
        data: result,
      };

      // veirify the balance 
      // request the balance to be locked
      // and create a transaction in the account after lock
      // queue this to be processed 
      // The queue will processed using ethersjs and instance of the smart contract will be created using
      // new ethers.Contract with an rpc and abi 
      //. this will return the required contract instance and will be mapped to the contract interface and the function can be called 
      //once complete the response will release the locked balance and then will update the transaction status to completed 

    } catch (error) {
      console.error("Error depositing to vault:", error);
      return {
        status: false,
        message: "Failed to deposit to vault.",
      };
    }
  }
}
