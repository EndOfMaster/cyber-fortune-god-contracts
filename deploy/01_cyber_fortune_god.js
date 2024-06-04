const { ethers } = require("hardhat");

const startTime = "1717516800"
const variationFactor = 5

const params = [startTime, variationFactor]

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let impl = await deploy('Impl', {
        from: deployer,
        contract: 'CyberFortuneGod',
        args: params,
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const CFD = await ethers.getContractFactory('CyberFortuneGod')
    const cfdImpl = CFD.attach(impl.address)

    const fragment = CFD.interface.getFunction('initialize(uint256, uint256)');
    const cfdProxyData = cfdImpl.interface.encodeFunctionData(fragment, params);

    let proxyAdminAddress = '';
    if (proxyAdminAddress == '') {
        proxyAdminAddress = (await deployments.get('ProxyAdmin')).address;
    }

    const ProxyAdmin = await hre.ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = ProxyAdmin.attach(proxyAdminAddress);

    let proxy = await deploy('CFD', {
        from: deployer,
        contract: 'MyTransparentUpgradeableProxy',
        args: [impl.address, proxyAdminAddress, cfdProxyData],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    const proxyAddress = proxy.address;
    const MyTransparentUpgradeableProxy = await ethers.getContractFactory('MyTransparentUpgradeableProxy')
    proxy = MyTransparentUpgradeableProxy.attach(proxy.address);

    let implAddress = await proxy.implementation();
    console.log("implAddress:", implAddress);

    if (implAddress !== ethers.AddressZero && implAddress !== impl.address) {
        await proxyAdmin.upgradeAndCall(proxyAddress, impl.address, cfdProxyData);
        console.log("upgrade Post Office impl done");
    }

};
module.exports.tags = ['CyberFortuneGod'];