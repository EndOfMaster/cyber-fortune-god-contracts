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
    },
    sepolia: {
      url: 'https://rpc2.sepolia.org/',
      accounts: [`${privateKey}`],
      chainId: 11155111,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
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
