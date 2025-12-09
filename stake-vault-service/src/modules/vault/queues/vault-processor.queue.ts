import { inject, injectable, singleton } from "tsyringe";
import { JOB_PARAMS } from "../vault.interface";
import { GrenacheClient } from "../../../client/grenache-client";
import { ACTIONS } from "../../../actions/index.actions";
import { Web3Service } from "../../web3/web3.service";

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
    });

    const transaction = data.data;

    if (!data.status || !transaction) {
      console.error(
        `Failed to retrieve transaction details for ID: ${transactionId}`
      );
      return;
    }

    const result = await this.web3Service.stakeTokenAmount(transaction.amount);

    if (!result) {
      const data = await GrenacheClient.request({
        action: ACTIONS.GET_TRANSACTION,
        data: { transactionId },
      });
    }

    // notify user
  }
}

export default VaultQueueProcessor;
