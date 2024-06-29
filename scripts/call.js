const hre = require("hardhat");
const { deployments, ethers } = hre;

async function main() {
  const CFG = await hre.ethers.getContractFactory("CyberFortuneGod");
  const cfdAddress = (await deployments.get('CFG')).address;
  const cfd = CFG.attach(cfdAddress);

  await cfd.offeringIncense("2552352", { value: ethers.parseEther("0.001") });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
