import dotenv from "dotenv";

dotenv.config();

export interface ContractConfig {
  address: string;
  chainRpcUrl: string;
  startBlock: number;
}

export const config = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "blockchain_indexer",
  contracts: {
    contract1: {
      address: "0x0000000000000000000000000000000000000000",
      chainRpcUrl: "<chainRpcUrl>",
      startBlock: 0, // TODO: set appropriate start block
    },
    contract2: {
      address: "0x0000000000000000000000000000000000000000",
      chainRpcUrl: "<chainRpcUrl>",
      startBlock: 0, // TODO: set appropriate start block
    },
  } as Record<string, ContractConfig>,
};
