const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let impl = await deploy('Impl', {
        from: deployer,
        contract: 'CyberFortuneGod',
        args: [1, 1],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    // const Vault = await ethers.getContractFactory('Vault')
    // const vaultImpl = Vault.attach(impl.address)

    // const fragment = Vault.interface.getFunction('initialize()');
    // const vaultProxyData = vaultImpl.interface.encodeFunctionData(fragment, []);

    // let proxyAdminAddress = '';
    // if (proxyAdminAddress == '') {
    //     proxyAdminAddress = (await deployments.get('ProxyAdmin')).address;
    // }

    // const ProxyAdmin = await hre.ethers.getContractFactory("ProxyAdmin");
    // const proxyAdmin = ProxyAdmin.attach(proxyAdminAddress);

    // let proxy = await deploy('Vault', {
    //     from: deployer,
    //     contract: 'MyTransparentUpgradeableProxy',
    //     args: [impl.address, proxyAdminAddress, vaultProxyData],
    //     log: true,
    //     skipIfAlreadyDeployed: true,
    // });
    // const proxyAddress = proxy.address;
    // const MyTransparentUpgradeableProxy = await ethers.getContractFactory('MyTransparentUpgradeableProxy')
    // proxy = MyTransparentUpgradeableProxy.attach(proxy.address);

    // let implAddress = await proxy.implementation();

    //BUG Unknown error. Check the call chain and find that the old impl address will be called.
    // if (implAddress !== ethers.AddressZero && implAddress !== impl.address) {
    //     await proxyAdmin.upgradeAndCall(proxyAddress, impl.address, vaultProxyData);
    //     console.log("upgrade Post Office impl done");
    // }

};
module.exports.tags = ['CyberFortuneGod'];