# cyber-fortune-god-contracts

财神爷求签系统的 Hardhat 合约项目，包含 CyberFortuneGod、MeritCoin 和 FortuneStick。

当前首发链范围：本地 Hardhat NSTChain（chainId `31337`）可写；Sepolia（`11155111`）和 NSTChain 公共网络（`2511`，RPC 为 `https://rpc.nstchain.com`）先作为应用只读链。其它网络配置保留为后续扩展。

### 1. build note
- Add the `PRIVATE_KEY` parameter in `.env`

### 2. deploy note
1. `deploy/01_cyber_fortune_god.js` need update `startTime`, After this time, the activity of the entire contract can start, and the update date is based on this judgment
2. `deploy/02_merit_coin.js` need add `receiver`, Which address is the initial amount minted to
3. `deploy/03_fortune_stick.js` new add `baseURI`, nft base address

### 3. deploy
```shell
npx hardhat deploy --network xxx
```
#### note
- xxx is the network configured in `hardhat.config.js`; public RPC does not imply that the application has a writable deployment
- test deploy is `npx hardhat deploy`

### 4. update contract
1. 普通部署不会升级已有代理；实现地址不一致时使用 `scripts/upgrade.js`
2. 设置 `NEW_IMPL_ADDRESS=0x... CONFIRM_UPGRADE=true` 后运行 `npx hardhat run scripts/upgrade.js --network xxx`
3. 使用 `scripts/exportManifest.js` 导出完整部署清单，再导入 Rails chain registry

### 5. BSC 部署（主网 56 / 测试网 97）

BSC 网络已在 `hardhat.config.js` 定义（`bsc`=56、`bsc-test`=97），编译产物固定
`evmVersion: shanghai`。**BSC 系网络强制使用带前缀的环境变量**，与既有链的全局
参数完全隔离，杜绝把其他链的经济参数照搬到 BSC（design D8）。

必需参数（任一缺失会在部署交易发出前直接失败）：

```shell
# 测试网（bsc-test）
BSC_TEST_CFG_START_TIME=1780000000            # 活动开始时间（Unix 秒，运营冻结值）
BSC_TEST_CFG_DECREASE_COEFFICIENT=1.04491013  # 每日衰减系数
BSC_TEST_CFG_TOTAL_SUPPLY_BY_DAY=888          # 每日 MERIT 供应量
BSC_TEST_CFG_MINT_PRICE=0.001                 # 上香单价（原生币 tBNB）
BSC_TEST_MERIT_COIN_RECEIVER=0x...            # 初始 888888 MERIT 接收地址
BSC_TEST_FORTUNE_STICK_BASE_URI=https://nft.caishenye.net   # 临时 baseURI（后端入口）

# 主网（bsc）使用 BSC_ 前缀，其余同名；主网 RPC 可用 BSC_RPC_URL 覆盖
```

部署与入库：

```shell
# 1. 部署（含 baseURI 链上读回与 owner/minter 权限核验）
npx hardhat deploy --network bsc-test

# 2. 导出版本化部署清单（CHAIN_EXPIRES_AT：公开配置的有效期，D2）
CHAIN_EXPIRES_AT=2026-12-31T00:00:00Z npm run export-manifest -- --network bsc-test

# 3. 后端导入清单（chain registry），导入后 BSC 以 read_only 上线，追平后再启用
CHAIN_REGISTRY_MANIFEST_FILE=deployments/bsc-test/manifest.json \
  bin/rails chain_registry:import_file   # 在 CaiShenNFT 仓库执行
```

注意：
- `PRIVATE_KEY` 对应地址即 deployer，同时也是初始 owner/ProxyAdmin owner；主网部署
  前必须逐项核对 `BSC_*` 参数与资金预算（G4 门禁）。
- 公共 RPC 不代表可写部署环境；主网建议配置私有 RPC（`BSC_RPC_URL`）。
