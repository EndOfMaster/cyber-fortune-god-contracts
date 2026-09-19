const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { deployments, ethers, network } = hre;

const CONTRACT_FILES = ["CFG", "Impl", "ProxyAdmin", "MeritCoin", "FortuneStick"];
const NETWORK_META = {
  hardhat: { name: "NSTChain Local (Hardhat)", symbol: "NST", rpc: "http://127.0.0.1:8545", environment: "development" },
  localhost: { name: "NSTChain Local (Hardhat)", symbol: "NST", rpc: "http://127.0.0.1:8545", environment: "development" },
  localhost2: { name: "NSTChain Local 2 (Hardhat)", symbol: "NST", rpc: "http://127.0.0.1:31338", environment: "development" },
  nstchain: { name: "NSTChain", symbol: "NST", rpc: "https://rpc.nstchain.com", environment: "production" },
  sepolia: { name: "Sepolia", symbol: "ETH", rpc: "https://ethereum-sepolia-rpc.publicnode.com", environment: "testnet" },
  bsc: { name: "BNB Smart Chain", symbol: "BNB", rpc: "https://bsc-dataseed.bnbchain.org", environment: "production" },
  "bsc-test": { name: "BNB Smart Chain Testnet", symbol: "tBNB", rpc: "https://bsc-testnet-rpc.publicnode.com", environment: "testnet" },
  arb: { name: "Arbitrum One", symbol: "ETH", rpc: "https://arb1.arbitrum.io/rpc", environment: "production" },
  "arb-test": { name: "Arbitrum Sepolia", symbol: "ETH", rpc: "https://sepolia-rollup.arbitrum.io/rpc", environment: "testnet" },
  robinhood: { name: "Robinhood Chain", symbol: "ETH", rpc: "https://rpc.mainnet.chain.robinhood.com", environment: "production" },
  "robinhood-test": { name: "Robinhood Chain Testnet", symbol: "ETH", rpc: "https://rpc.testnet.chain.robinhood.com", environment: "testnet" }
};

function hashJson(value) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function parseChainId(value) {
  return Number.parseInt(value, value.toLowerCase().startsWith("0x") ? 16 : 10);
}

async function readDeployment(name) {
  try {
    return await deployments.get(name);
  } catch {
    throw new Error(`缺少 ${name} 部署清单，请先完成整套部署后再导出`);
  }
}

async function main() {
  const deploymentFiles = Object.fromEntries(
    await Promise.all(CONTRACT_FILES.map(async (name) => [name, await readDeployment(name)]))
  );
  const chainId = parseChainId(await hre.network.provider.send("eth_chainId"));
  const meta = NETWORK_META[network.name] || {
    name: network.name,
    symbol: "ETH",
    rpc: process.env.PUBLIC_RPC_URL || "",
    environment: "testnet"
  };
  if (!meta.rpc && !process.env.PUBLIC_RPC_URL) {
    throw new Error(`请为 ${network.name} 设置 PUBLIC_RPC_URL 后再导出公开部署清单`);
  }
  if (meta.environment !== "development" && !process.env.CHAIN_EXPIRES_AT) {
    throw new Error(`导出 ${network.name} 清单前必须设置 CHAIN_EXPIRES_AT，避免无期限公开配置`);
  }

  const CFG = await ethers.getContractAt("CyberFortuneGod", deploymentFiles.CFG.address);
  const MeritCoin = await ethers.getContractAt("MeritCoin", deploymentFiles.MeritCoin.address);
  const FortuneStick = await ethers.getContractAt("FortuneStick", deploymentFiles.FortuneStick.address);
  const [deployer] = await ethers.getSigners();
  const parameters = {
    start_time: (await CFG.startTime()).toString(),
    decrease_coefficient: (await CFG.decreaseCoefficient()).toString(),
    total_supply_by_day: (await CFG.totalSupplyByDay()).toString(),
    mint_price: (await CFG.mintPrice()).toString(),
    draw_merit_cost: "8",
    merit_decimals: (await MeritCoin.decimals()).toString(),
    initial_receiver: process.env.MERIT_COIN_RECEIVER || deployer.address
  };

  const abiHashes = Object.fromEntries(
    CONTRACT_FILES.map((name) => [name, hashJson(deploymentFiles[name].abi)])
  );
  const combinedAbiHash = hashJson(abiHashes);
  const manifestVersion = process.env.MANIFEST_VERSION || "1";
  const deploymentId = process.env.DEPLOYMENT_ID || `${network.name}-v${manifestVersion}`;
  const status = process.env.CHAIN_STATUS || (network.name === "sepolia" ? "read_only" : "enabled");
  const validFromBlock = Number.parseInt(process.env.DEPLOYMENT_VALID_FROM_BLOCK || "0", 10);

  const manifest = {
    schema_version: "1",
    manifest_version: manifestVersion,
    build_commit: process.env.BUILD_COMMIT || "uncommitted",
    config_version: process.env.CONFIG_VERSION || `${network.name}-${manifestVersion}`,
    chain_id: chainId,
    rpc_chain_id: chainId,
    public_rpc_url: process.env.PUBLIC_RPC_URL || meta.rpc,
    chain: {
      name: process.env.CHAIN_NAME || meta.name,
      native_symbol: process.env.CHAIN_SYMBOL || meta.symbol,
      native_decimals: 18,
      environment: meta.environment,
      status,
      is_default: network.name === "localhost" || network.name === "hardhat",
      confirmation_mode: process.env.CONFIRMATION_MODE || "confirmations",
      confirmations: Number.parseInt(process.env.BLOCKCHAIN_CONFIRMATIONS || "6", 10),
      expires_at: process.env.CHAIN_EXPIRES_AT || null
    },
    deployment: {
      deployment_id: deploymentId,
      fortune_god_address: deploymentFiles.CFG.address,
      merit_coin_address: deploymentFiles.MeritCoin.address,
      fortune_stick_address: deploymentFiles.FortuneStick.address,
      proxy_admin_address: deploymentFiles.ProxyAdmin.address,
      fortune_god_impl_address: deploymentFiles.Impl.address,
      abi_version: process.env.ABI_VERSION || "v2",
      abi_hash: combinedAbiHash,
      code_version: process.env.CODE_VERSION || "CyberFortuneGod@0.1",
      parameters,
      valid_from_block: validFromBlock,
      status: "active",
      is_active: true
    },
    abi_hashes: abiHashes
  };

  const outputPath = path.resolve(process.env.MANIFEST_OUTPUT || path.join("deployments", network.name, "manifest.json"));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, chain_id: chainId, deployment_id: deploymentId, abi_hash: combinedAbiHash }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
