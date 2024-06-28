const { ethers } = require("hardhat");

const startTime = "1717516800"
const decreaseCoefficient = ethers.parseEther("1.04491013")
const totalSupplyByDay = ethers.parseEther("888")
const mintPrice = ethers.parseEther("0.001")

const params = [startTime, decreaseCoefficient, totalSupplyByDay, mintPrice]

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

    const fragment = CFD.interface.getFunction('initialize(uint256, uint256, uint256, uint256)');
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

    const oldImplAddress = await proxyAdmin.getProxyImplementation(proxyAddress)

    if (oldImplAddress !== ethers.AddressZero && oldImplAddress !== impl.address) {
        await proxyAdmin.upgrade(proxyAddress, impl.address);
        console.log("upgrade Cyber Fortune God impl done");
    }
};
module.exports.tags = ['CyberFortuneGod'];