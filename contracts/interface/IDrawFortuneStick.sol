// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IDrawFortuneStick {
    function drawFortune(address _to) external returns (uint256 _tokenId);

    function getStickNo(uint256 _tokenId) external view returns (uint256);
}
