// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MeritCoin is ERC20 {
    address public immutable minter;

    constructor(address _minter, address _receiver) ERC20("Merit", "MERIT") {
        minter = _minter;
        _mint(_receiver, 10 ** decimals() * 888888);
    }

    function mint(address _to, uint256 _amount) external {
        require(msg.sender == minter, "MERIT: You are not minter");
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(msg.sender, _amount);
    }
}
