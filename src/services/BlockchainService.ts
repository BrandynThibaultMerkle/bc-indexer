import { ethers } from "ethers";
import retryAsPromised from "retry-as-promised";

export class BlockchainService {
  private providers: Map<string, ethers.providers.JsonRpcProvider> = new Map();

  getProvider(rpcUrl: string): ethers.providers.JsonRpcProvider {
    if (!this.providers.has(rpcUrl)) {
      this.providers.set(rpcUrl, new ethers.providers.JsonRpcProvider(rpcUrl));
    }
    return this.providers.get(rpcUrl)!;
  }

  private runPromiseWithRetry<T>(callback: () => Promise<T>): Promise<T> {
    return retryAsPromised(callback, {
      max: 3,
      backoffBase: 3000,
      backoffExponent: 1.1,
    });
  }

  async getLogsForContract(
    contractAddress: string,
    fromBlock: number,
    toBlock: number,
    rpcUrl: string
  ): Promise<ethers.providers.Log[]> {
    return this.runPromiseWithRetry(async () => {
      const provider = this.getProvider(rpcUrl);
      return provider.getLogs({
        address: contractAddress,
        fromBlock,
        toBlock,
      });
    });
  }

  async getCurrentBlockNumber(rpcUrl: string): Promise<bigint> {
    return this.runPromiseWithRetry(async () => {
      const provider = this.getProvider(rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      return BigInt(blockNumber);
    });
  }
}
