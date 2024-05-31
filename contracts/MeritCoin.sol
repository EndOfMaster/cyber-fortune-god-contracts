// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MeritCoin is ERC20 {
    address public immutable minter;

    constructor(address _minter) ERC20("MeritCoin", "MC") {
        minter = _minter;
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == minter, "MeritCoin: You are not minter");
        _mint(_to, _amount);
    }
}
