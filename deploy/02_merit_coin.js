const { ethers } = require("hardhat");

const receiver = "0xe0595A49f42E79126B7c400AA45BDa3343Be4B64"

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
