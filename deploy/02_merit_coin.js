const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const CFD = await ethers.getContractFactory('CyberFortuneGod')
    const cfdAddress = (await deployments.get('CFD')).address;
    const cfd = CFD.attach(cfdAddress);

    let meritCoin = await deploy('MeritCoin', {
        from: deployer,
        args: [cfdAddress, receiver],
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
