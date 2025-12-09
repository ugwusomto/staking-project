import { inject, injectable, singleton } from "tsyringe";
import { JOB_PARAMS } from "../vault.interface";
import { GrenacheClient } from "../../../client/grenache-client";
import { ACTIONS } from "../../../actions/index.actions";
import { Web3Service } from "../../web3/web3.service";
import { TRANSACTION_STATUS } from "../vault.config";

@singleton()
class VaultQueueProcessor {
  constructor(
    @inject(Web3Service)
    private readonly web3Service: Web3Service
  ) {}

  public async processSmartContractActions(params: JOB_PARAMS): Promise<void> {
    const { transactionId, action, token } = params;

    console.log(
      `Processing action: ${action} for transaction ID: ${transactionId}`
    );

    const data = await GrenacheClient.request({
      action: ACTIONS.GET_TRANSACTION,
      data: { transactionId },
      token,
    });

    console.log("Transaction data retrieved: ", data);

    const transaction = data.data;

    if (!data.status || !transaction) {
      console.error(
        `Failed to retrieve transaction details for ID: ${transactionId}`
      );
      return;
    }

    // Process based on action because you need to know when it is staking vs unstaking

    const result = await this.web3Service.stakeTokenAmount(transaction.amount);
    const transactionUpdate = await GrenacheClient.request({
      action: ACTIONS.COMPLETE_STAKE_AND_UNSTAKE,
      data: {
        transactionId,
        status: result
          ? TRANSACTION_STATUS.COMPLETED
          : TRANSACTION_STATUS.FAILED,
      },
      token,
    });

    if (!transactionUpdate.status) {
      console.error(
        `Failed to update transaction status for ID: ${transactionId}`
      );
    } else {
      console.log(`Transaction ID: ${transactionId} processed successfully.`);
    }

    // notify user
  }
}

export default VaultQueueProcessor;
