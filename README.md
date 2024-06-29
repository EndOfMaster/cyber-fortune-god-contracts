# cyber-fortune-god-contracts

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
- xxx is the network configured in `hardhat.config.js`
- test deploy is `npx hardhat deploy`

### 4. update contract
1. delete `deployment/xxx/yyy` (xxx: network, yyy: Impl.json)
2. run deploy shell `npx hardhat deploy --network xxx`