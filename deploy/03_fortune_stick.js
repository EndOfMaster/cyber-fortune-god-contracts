const baseURI = "https://test.caishenye.net"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const CFG = await ethers.getContractFactory('CyberFortuneGod')
    const cfdAddress = (await deployments.get('CFG')).address;
    const cfd = CFG.attach(cfdAddress);

    let fortuneStick = await deploy('FortuneStick', {
        from: deployer,
        args: [cfdAddress, baseURI],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const getFortuneStick = await cfd.fortuneStick();
    if (getFortuneStick == ethers.ZeroAddress) {
        await cfd.initFortuneStick(fortuneStick.address)
        console.log("init FortuneStick done");
    }

};
module.exports.tags = ['FortuneStick'];
