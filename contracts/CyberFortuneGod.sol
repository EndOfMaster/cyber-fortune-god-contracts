// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract CyberFortuneGod {
    uint256 public constant totalSupplyByDay = 888;
    uint256 public constant firstMintByDay = 88;
    uint256 public constant secondMintByDay = 66;
    uint256 public constant thirdMintByDay = 36;

    uint256 public immutable startTime;
    uint256 public immutable variationFactor;

    uint256 public remainingSupply;
    uint256 public lastDecrement;

    //Days => mintNum
    mapping(uint256 => uint256) public mintNum;

    constructor(uint256 _startTime, uint256 _variationFactor) {
        startTime = _startTime;
        variationFactor = _variationFactor;
        remainingSupply = totalSupplyByDay;
    }

    function getMintAmount() private returns (uint256 _returns) {
        if (remainingSupply == 0) {
            return 0;
        }

        uint256 _days = (block.timestamp - startTime) / (24 * 60 * 60);
        uint256 _mintNum = mintNum[_days];

        if (_mintNum < 3) {
            _returns = getTop3Amount(_mintNum);
        } else {
            uint256 _randomSub = random(0, variationFactor);
            _returns = _randomSub >= lastDecrement ? lastDecrement : lastDecrement - _randomSub;
        }

        if (_returns >= remainingSupply) {
            _returns = remainingSupply;
            remainingSupply = 0;
            lastDecrement = 0;
            return _returns; // Return 0 if the random decrement is greater than the remaining supply
        }

        lastDecrement = _returns;
        remainingSupply -= _returns;
        if (_returns > 0) {
            mintNum[_days] = _mintNum + 1;
        }
    }

    function random(uint256 min, uint256 max) public view returns (uint256) {
        require(max > min, "max must be greater than min");
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao)));
        return (randomHash % (max - min + 1)) + min;
    }

    function getTop3Amount(uint256 _mintNum) private pure returns (uint256 _returns) {
        if (_mintNum == 0) return firstMintByDay;
        if (_mintNum == 1) return secondMintByDay;
        if (_mintNum == 2) return thirdMintByDay;
    }
}
