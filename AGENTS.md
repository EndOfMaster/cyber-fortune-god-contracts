# cyber-fortune-god-contracts —— 财神爷求签智能合约

本文档供 AI 编程助手阅读，用于快速理解本项目的技术栈、合约架构和开发部署约定。

---

## 项目概述

本项目是「财神爷求签 NFT」系统的以太坊智能合约层，包含三个核心合约：

- **CyberFortuneGod**：主控合约，负责「上香」烧币、「抽签」触发 NFT 铸造，并管理每日发行量、价格等全局参数。
- **MeritCoin**：ERC-20 功德币，由 CyberFortuneGod 调用 `mint` 发放给上香用户。
- **FortuneStick**：ERC-721 签筒 NFT，由 CyberFortuneGod 调用 `draw` 铸造抽签结果。

合约采用 **OpenZeppelin Transparent Upgradeable Proxy** 模式部署，`CyberFortuneGod` 支持逻辑合约升级。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 开发框架 | Hardhat ^2.22.4 |
| 合约标准库 | @openzeppelin/contracts 4.7.3 |
| 可升级合约 | @openzeppelin/contracts-upgradeable 4.7.3 |
| 部署插件 | hardhat-deploy ^0.12.4 |
| 验证插件 | @nomicfoundation/hardhat-verify |
| 编程语言 | Solidity 0.8.20（optimizer enabled, runs: 200） |
| 测试框架 | Hardhat Network + Hardhat Toolbox |

---

## 合约架构

```
contracts/
  CyberFortuneGod.sol              # 主控逻辑合约（可升级）
  MeritCoin.sol                    # ERC-20 功德币
  FortuneStick.sol                 # ERC-721 签筒 NFT
  interface/
    IMeritCoin.sol                 # MeritCoin 接口
    IFortuneStick.sol              # FortuneStick 接口
  lib/
    ProxyAdmin.sol                 # 代理管理员
    MyTransparentUpgradeableProxy.sol  # 透明可升级代理实现
deploy/
  00_proxy_admin.js                # 部署 ProxyAdmin
  01_cyber_fortune_god.js          # 部署 CyberFortuneGod 实现 + 代理
  02_merit_coin.js                 # 部署并初始化 MeritCoin
  03_fortune_stick.js              # 部署并初始化 FortuneStick
args/
  cfg.js                           # CyberFortuneGod 初始化参数
```

### 关键事件

- `OfferingIncense(address _sender, uint256 _mintAmount)` — 上香成功
- `DrawFortune(address _sender, uint256 _tokenId, uint256 _stickNo)` — 抽签成功
- `UpdateSupplyByDay(...)` / `SetTotalSupplyByDay(...)` / `SetMintPrice(...)` — 运营参数调整

---

## 安装与开发命令

```bash
# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 运行测试（默认本地 Hardhat 网络）
npx hardhat test

# 启动本地节点
npx hardhat node
```

---

## 部署流程

### 1. 配置环境

复制或创建 `.env`，填入：

| 变量 | 说明 |
|------|------|
| `PRIVATE_KEY` | 部署者私钥（**切勿提交到 Git**） |
| `ETHERSCAN_API_KEY` | 用于合约源码验证（可选） |

### 2. 确认初始化参数

`args/cfg.js` 包含 `CyberFortuneGod` 的初始化参数：

- `startTime`：合约活动开始时间戳
- `decreaseCoefficient`：每日衰减系数
- `totalSupplyByDay`：每日总供应量
- `mintPrice`：上香价格

部署前务必根据实际业务更新这些值。

### 3. 网络与部署

```bash
# 默认本地网络
npx hardhat deploy

# 指定网络（网络配置见 hardhat.config.js）
npx hardhat deploy --network <network_name>
```

当前应用首发范围是本地 Hardhat NSTChain（chainId `31337`）和 Sepolia（chainId `11155111`）。NSTChain 公共 RPC 为 `https://rpc.nstchain.com`（chainId `2511`），在应用注册表中先作为只读链使用；其它网络配置保留为公共 RPC 的后续扩展，不会自动进入应用支持列表。

Hardhat 配置中的公共 RPC 只用于显式指定网络时的连接，部署到非本地网络前必须完成参数、receiver、metadata host、私钥和版本化部署清单审核。

### 4. 部署脚本注意点

- `01_cyber_fortune_god.js`：
  - 先部署 `CyberFortuneGod` 实现合约（命名 `Impl`）
  - 再部署 `MyTransparentUpgradeableProxy` 代理（命名 `CFG`）
  - 普通部署不会隐式升级已有代理；实现地址不一致时必须显式运行 `scripts/upgrade.js`
- `02_merit_coin.js`：
  - 需要设置 `receiver`（初始铸币接收地址），未设置时默认使用 `deployer`
  - 部署后自动调用 `cfd.initMeritCoin`
- `03_fortune_stick.js`：
  - 需要设置 `baseURI`（NFT metadata 基础地址）
  - 部署后自动调用 `cfd.initFortuneStick`

---

## 升级流程

如需升级 `CyberFortuneGod` 逻辑合约：

1. 修改 `CyberFortuneGod.sol` 后重新编译。
2. 部署新的实现合约并记录新地址，保留 `CFG.json` 与 `ProxyAdmin.json`。
3. 设置 `NEW_IMPL_ADDRESS` 和 `CONFIRM_UPGRADE=true`，显式执行：

```bash
NEW_IMPL_ADDRESS=0x... CONFIRM_UPGRADE=true \
  npx hardhat run scripts/upgrade.js --network <network_name>
```

升级脚本会输出当前/目标实现地址及 storage layout 摘要；兼容性仍需人工审核，不会自动声称安全。

### 5. 部署清单

整套合约部署完成后，可导出供 Rails chain registry 导入的版本化清单：

```bash
CHAIN_EXPIRES_AT=2026-12-31T23:59:59Z \
  npx hardhat run scripts/exportManifest.js --network sepolia
MANIFEST_FILE=deployments/sepolia/manifest.json \
  bin/rails chain_registry:import_file
```

导出前必须存在 `CFG`、`Impl`、`ProxyAdmin`、`MeritCoin` 和 `FortuneStick` 五份部署记录；缺少任一项会直接失败。

---

## 源码验证

部署后可使用 Hardhat Verify 插件验证合约源码：

```bash
npx hardhat verify --network <network_name> <contract_address> [constructor_args]
```

配置中同时启用了 Etherscan 与 Sourcify。

---

## 安全注意事项

1. **私钥安全**：`PRIVATE_KEY` 必须仅保存在本地 `.env` 中，**绝不能提交到 Git**。
2. **代理管理员**：`ProxyAdmin` 的 owner 拥有升级权限，部署后应根据治理需求转移至多签或 DAO。
3. **初始化参数**：`startTime`、`mintPrice`、`totalSupplyByDay` 一旦初始化即上链，部署前务必核对。
4. **MeritCoin 初始铸币**：`receiver` 地址会一次性获得 888,888 枚 MERIT，确认接收地址正确。
5. **FortuneStick baseURI**：应为稳定、可长期维护的 metadata 服务地址（如后端 metadata API）。
