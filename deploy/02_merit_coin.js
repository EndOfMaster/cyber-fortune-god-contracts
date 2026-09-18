const { ethers } = require("hardhat");
const { parameter } = require("../args/params");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const receiver = parameter("MERIT_COIN_RECEIVER");

    const CFG = await ethers.getContractFactory('CyberFortuneGod');
    const cfdAddress = (await deployments.get('CFG')).address;
    const cfd = CFG.attach(cfdAddress);

    const meritCoin = await deploy('MeritCoin', {
        from: deployer,
        args: [cfdAddress, receiver || deployer],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const getMeritCoin = await cfd.meritCoin();
    if (getMeritCoin === ethers.ZeroAddress) {
        await cfd.initMeritCoin(meritCoin.address)
        console.log("init MeritCoin done");
    } else if (getMeritCoin.toLowerCase() !== meritCoin.address.toLowerCase()) {
        throw new Error(`CFG meritCoin is initialized to ${getMeritCoin}, expected ${meritCoin.address}`);
    }

};
module.exports.tags = ['MeritCoin'];
