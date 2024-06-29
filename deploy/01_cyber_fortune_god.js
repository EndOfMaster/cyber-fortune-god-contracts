const { ethers } = require("hardhat");
const params = require('../args/cfg')

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

    const CFG = await ethers.getContractFactory('CyberFortuneGod')
    const cfdImpl = CFG.attach(impl.address)

    const fragment = CFG.interface.getFunction('initialize(uint256, uint256, uint256, uint256)');
    const cfdProxyData = cfdImpl.interface.encodeFunctionData(fragment, params);
    console.log('proxy data', cfdProxyData)

    let proxyAdminAddress = '';
    if (proxyAdminAddress == '') {
        proxyAdminAddress = (await deployments.get('ProxyAdmin')).address;
    }

    const ProxyAdmin = await hre.ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = ProxyAdmin.attach(proxyAdminAddress);

    let proxy = await deploy('CFG', {
        from: deployer,
        contract: 'MyTransparentUpgradeableProxy',
        args: [impl.address, proxyAdminAddress, cfdProxyData],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const proxyAddress = proxy.address;

    const MyTransparentUpgradeableProxy = await ethers.getContractFactory('MyTransparentUpgradeableProxy')
    proxy = MyTransparentUpgradeableProxy.attach(proxy.address);

    const oldImplAddress = await proxyAdmin.getProxyImplementation(proxyAddress)

    if (oldImplAddress !== ethers.AddressZero && oldImplAddress !== impl.address) {
        await proxyAdmin.upgrade(proxyAddress, impl.address);
        console.log("upgrade Cyber Fortune God impl done");
    }
};
module.exports.tags = ['CyberFortuneGod'];
