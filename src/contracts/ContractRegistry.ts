import { ethers } from "ethers";
import { config, ContractConfig } from "../config/config";

interface ContractInfo {
  name: string;
  config: ContractConfig;
  abi: any[];
  interface: ethers.utils.Interface;
  queueName: string;
}

export class ContractRegistry {
  private static contracts: Map<string, ContractInfo> = new Map();

  static registerContract(name: string, abi: any[]): void {
    const contractConfig = config.contracts[name];
    if (!contractConfig) {
      throw new Error(`Contract configuration not found for: ${name}`);
    }

    const contractInterface = new ethers.utils.Interface(abi);
    this.contracts.set(name, {
      name,
      config: contractConfig,
      abi,
      interface: contractInterface,
      queueName: `logs:${name}`,
    });
  }

  static getContractInfo(name: string): ContractInfo {
    const contractInfo = this.contracts.get(name);
    if (!contractInfo) {
      throw new Error(`Contract not registered: ${name}`);
    }
    return contractInfo;
  }

  static getAllContracts(): ContractInfo[] {
    return Array.from(this.contracts.values());
  }
}

// Register your contracts here, add only the needed functions for processing events
ContractRegistry.registerContract("contract1", [
  // TODO: add abi
]);

ContractRegistry.registerContract("contract2", [
  // TODO: add abi
]);
