const hre = require("hardhat");
const { deployments, ethers } = hre;

const baseURI= "https://caisheng-api.mdzhas.com"

async function main() {
  const FortuneStick = await hre.ethers.getContractFactory("FortuneStick");
  const address = (await deployments.get('FortuneStick')).address;
  const fortuneStick = FortuneStick.attach(address);

  await fortuneStick.setBaseURI(baseURI);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
