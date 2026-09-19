require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('hardhat-deploy');
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";
const scanKey = process.env.ETHERSCAN_API_KEY ?? "ETHERSCAN_API_KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      // bin/dev-local --two-chains 通过 HARDHAT_NODE_CHAIN_ID 让第二个
      // `hardhat node` 进程以 31338 起链；hardhat v2 无 --chainId CLI 参数。
      chainId: Number.parseInt(process.env.HARDHAT_NODE_CHAIN_ID || '31337', 10),
    },
    localhost: {
      url: process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    // bin/dev-local --two-chains 的第二本地节点（hardhat node --chainId 31338）。
    localhost2: {
      url: process.env.LOCAL_RPC_URL_2 || 'http://127.0.0.1:31338',
      chainId: 31338,
    },
    nstchain: {
      url: process.env.NSTCHAIN_RPC_URL || 'https://rpc.nstchain.com',
      accounts: [`${privateKey}`],
      chainId: 2511,
    },
    ethereum: {
      url: 'https://ethereum-rpc.publicnode.com',
      accounts: [`${privateKey}`],
      chainId: 1,
      // gasPrice: 1000000000,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: [`${privateKey}`],
      chainId: 11155111,
    },
    // for mainnet
    "base-mainnet": {
      url: 'https://base-rpc.publicnode.com',
      accounts: [`${privateKey}`],
      chainId: 8453,
      gasPrice: 1000000000,
    },
    // for Sepolia testnet
    "base-sepolia": {
      url: "https://base-sepolia-rpc.publicnode.com",
      accounts: [`${privateKey}`],
      chainId: 84532,
      gasPrice: 1000000000,
    },
    "polygon-mumbai": {
      url: 'https://polygon-mumbai-bor-rpc.publicnode.com',
      accounts: [`${privateKey}`],
      chainId: 80001,
    },
    // BNB Smart Chain 主网（chain 56）：RPC 可用 BSC_RPC_URL 覆盖，
    // 部署参数必须使用 BSC_ 前缀环境变量（见 args/params.js）。
    "bsc": {
      url: process.env.BSC_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
      accounts: [`${privateKey}`],
      chainId: 56,
      gasPrice: 1000000000,
    },
    // BNB Smart Chain 测试网（chain 97）：参数使用 BSC_TEST_ 前缀环境变量。
    "bsc-test": {
      url: process.env.BSC_TEST_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com',
      accounts: [`${privateKey}`],
      chainId: 97,
    },
    // Arbitrum One（chain 42161）：参数使用 ARB_ 前缀环境变量。
    "arb": {
      url: process.env.ARB_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      accounts: [`${privateKey}`],
      chainId: 42161,
    },
    // Arbitrum Sepolia 测试网（chain 421614）：参数使用 ARB_TEST_ 前缀。
    "arb-test": {
      url: process.env.ARB_TEST_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: [`${privateKey}`],
      chainId: 421614,
    },
    // Robinhood Chain 主网（chain 4663，Arbitrum Orbit/Nitro，ETH gas）：参数使用
    // ROBINHOOD_ 前缀环境变量。
    "robinhood": {
      url: process.env.ROBINHOOD_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',
      accounts: [`${privateKey}`],
      chainId: 4663,
    },
    // Robinhood Chain 测试网（chain 46630）：参数使用 ROBINHOOD_TEST_ 前缀。
    "robinhood-test": {
      url: process.env.ROBINHOOD_TEST_RPC_URL || 'https://rpc.testnet.chain.robinhood.com',
      accounts: [`${privateKey}`],
      chainId: 46630,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          // 显式固定 EVM target（含 PUSH0 的 Shanghai 语义），BSC 主网/测试网
          // 均已支持；新增候选链须先验证 opcode 兼容性再放开。
          evmVersion: "shanghai",
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./deploy",
    deployments: "./deployments",
  },
  namedAccounts: {
    deployer: 0
  },
  etherscan: {
    apiKey: scanKey,
  },
  sourcify: {
    enabled: true
  },
};
