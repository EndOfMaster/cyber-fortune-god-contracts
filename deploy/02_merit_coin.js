const { ethers } = require("hardhat");

const receiver = null;

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const CFG = await ethers.getContractFactory('CyberFortuneGod')
    const cfdAddress = (await deployments.get('CFG')).address;
    const cfd = CFG.attach(cfdAddress);

    let meritCoin = await deploy('MeritCoin', {
        from: deployer,
        args: [cfdAddress, receiver || deployer],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const getMeritCoin = await cfd.meritCoin();
    if (getMeritCoin == ethers.ZeroAddress) {
        await cfd.initMeritCoin(meritCoin.address)
        console.log("init MeritCoin done");
    }

};
module.exports.tags = ['MeritCoin'];
