import { ethers } from "ethers";
import { BlockchainService } from "./BlockchainService";
import { RedisService } from "./RedisService";
import { ContractRegistry } from "../contracts/ContractRegistry";
import { ContractConfig } from "../config/config";
import { convertBigNumberToString } from "../utils/bigNumberUtils";

export class ContractService {
  private blockchainService: BlockchainService;
  private redisService: RedisService;

  constructor(
    blockchainService: BlockchainService,
    redisService: RedisService
  ) {
    this.blockchainService = blockchainService;
    this.redisService = redisService;
  }

  private decodeLogs(
    logs: ethers.providers.Log[],
    contractInterface: ethers.utils.Interface
  ) {
    return logs
      .map((log) => {
        try {
          const parsedLog = contractInterface.parseLog(log);
          const convertedArgs = convertBigNumberToString(parsedLog.args);

          return {
            event: parsedLog.name,
            args: convertedArgs,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex.toString(),
          };
        } catch (error) {
          console.error(`[ContractService] Failed to decode log: ${error}`);
          return null;
        }
      })
      .filter(
        (decodedLog): decodedLog is NonNullable<typeof decodedLog> =>
          decodedLog !== null
      );
  }

  async indexContractLogs(
    contractName: string,
    contractConfig: ContractConfig,
    fromBlock: number,
    toBlock: number
  ): Promise<number> {
    console.log(
      `[ContractService] Fetching logs for ${contractName} from block ${fromBlock} to ${toBlock}`
    );
    const logs = await this.blockchainService.getLogsForContract(
      contractConfig.address,
      fromBlock,
      toBlock,
      contractConfig.chainRpcUrl
    );
    console.log(
      `[ContractService] Found ${logs.length} logs for ${contractName}`
    );

    const contractInfo = ContractRegistry.getContractInfo(contractName);
    const decodedLogs = this.decodeLogs(logs, contractInfo.interface);

    console.log(
      `[ContractService] Decoded ${decodedLogs.length} logs for ${contractName}`
    );

    for (const decodedLog of decodedLogs) {
      console.log(
        `[ContractService] Processing log: Event=${decodedLog.event}, Block=${decodedLog.blockNumber}, TxHash=${decodedLog.transactionHash}`
      );
      await this.redisService.addToQueue(
        contractInfo.queueName,
        JSON.stringify(decodedLog)
      );
    }

    return decodedLogs.length;
  }
}
