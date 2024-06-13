// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./MeritCoin.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CyberFortuneGod is OwnableUpgradeable {
    uint256 public constant totalSupplyByDay = 888;
    uint256 public constant firstMintByDay = 88;
    uint256 public constant secondMintByDay = 66;
    uint256 public constant thirdMintByDay = 36;
    uint256 public constant mintPrice = 1e15;

    uint256 public startTime;
    uint256 public variationFactor;

    uint256 public remainingSupply;
    uint256 public lastDecrement;

    MeritCoin public meritCoin;

    //Record the number of mint successes every day since the start
    //days => mint times
    mapping(uint256 => uint256) public mintNum;

    //Record whether the distribution volume is updated on that day
    mapping(uint256 => bool) public updateSupplyByDay;

    mapping(uint256 => mapping(address => uint256)) public userMintNumByDay;

    event OfferingIncense(address _sender, uint256 _mintAmount);

    event WithdrawETH(address _sender, address _receiver, uint256 _amount);

    event UpdateSupplyByDay(address _sender, uint256 _days, uint256 _timestamp);

    function initialize(uint256 _startTime, uint256 _variationFactor) public initializer {
        __Ownable_init();
        startTime = _startTime;
        variationFactor = _variationFactor;
        remainingSupply = totalSupplyByDay;
        meritCoin = new MeritCoin(address(this));

        uint256 _decimals = meritCoin.decimals();
        meritCoin.mint(msg.sender, 10 ** _decimals * 888888);
    }

    // ==================== non-view function ====================

    //main user function
    function offeringIncense(uint256 _nonce) external payable {
        require(msg.value >= mintPrice, "CyberFortuneGod: Insufficient incense money");

        uint256 _days = getDays();

        require(userMintNumByDay[_days][msg.sender] < 3, "CyberFortuneGod: Mint up to three times a day");

        //update supply by day
        if (!updateSupplyByDay[_days]) {
            updateSupplyByDay[_days] = true;
            remainingSupply = totalSupplyByDay;

            emit UpdateSupplyByDay(msg.sender, _days, block.timestamp);
        }

        uint256 _returns = getMintAmount(_nonce);
        require(_returns > 0, "CyberFortuneGod: The incense money has been distributed out today");

        userMintNumByDay[_days][msg.sender] += 1;

        uint256 _decimals = meritCoin.decimals();
        uint256 _mintAmount = 10 ** _decimals * _returns;
        meritCoin.mint(msg.sender, _mintAmount);

        emit OfferingIncense(msg.sender, _mintAmount);
    }

    // ==================== view function ====================

    function random(uint256 min, uint256 max, uint256 _nonce) public view returns (uint256) {
        require(max > min, "max must be greater than min");
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, _nonce)));
        return (randomHash % (max - min + 1)) + min;
    }

    function getDays() public view returns (uint256) {
        return (block.timestamp - startTime) / (24 * 60 * 60);
    }

    // ==================== private function ====================

    function getMintAmount(uint256 _nonce) private returns (uint256 _returns) {
        if (remainingSupply == 0) {
            return 0;
        }

        uint256 _days = getDays();
        uint256 _mintNum = mintNum[_days];

        if (_mintNum < 3) {
            _returns = getTop3Amount(_mintNum);
        } else {
            uint256 _randomSub = random(0, variationFactor, _nonce);
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

    function getTop3Amount(uint256 _mintNum) private pure returns (uint256 _returns) {
        if (_mintNum == 0) return firstMintByDay;
        if (_mintNum == 1) return secondMintByDay;
        if (_mintNum == 2) return thirdMintByDay;
    }

    // ==================== owner function ====================

    function withdrawETH(address _to) external onlyOwner {
        uint256 _balance = address(this).balance;
        payable(_to).transfer(_balance);

        emit WithdrawETH(msg.sender, _to, _balance);
    }

    receive() external payable {}
}
