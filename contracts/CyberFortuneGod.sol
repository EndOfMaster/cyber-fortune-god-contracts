// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./interface/IMeritCoin.sol";
import "./interface/IFortuneStick.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CyberFortuneGod is OwnableUpgradeable {
    uint256 public constant firstMintByDay = 88;
    uint256 public constant secondMintByDay = 66;
    uint256 public constant thirdMintByDay = 36;
    uint256 public constant fourthMintByDay = 30;

    address public meritCoin;
    address public fortuneStick;

    uint256 public startTime;
    uint256 public totalSupplyByDay;
    uint256 public decreaseCoefficient; //1.04491013
    uint256 public mintPrice;

    uint256 public remainingSupply;
    uint256 public lastDecrement;

    //Record the number of mint successes every day since the start
    //days => mint times
    mapping(uint256 => uint256) public mintNum;

    //Record whether the distribution volume is updated on that day
    mapping(uint256 => bool) public updateSupplyByDay;

    mapping(uint256 => mapping(address => uint256)) public userMintNumByDay;

    event OfferingIncense(address _sender, uint256 _mintAmount);
    event DrawFortune(address _sender, uint256 _tokenId, uint256 _stickNo);
    event UpdateSupplyByDay(address _sender, uint256 _days, uint256 _timestamp);

    event InitMeritCoin(address _sender, address _meritCoin);
    event WithdrawETH(address _sender, address _receiver, uint256 _amount);
    event SetTotalSupplyByDay(address _sender, uint256 _old, uint256 _new);
    event SetMintPrice(address _sender, uint256 _old, uint256 _new);
    event SetDecreaseCoefficient(address _sender, uint256 _old, uint256 _new);

    constructor(uint256 _startTime, uint256 _decreaseCoefficient, uint256 _totalSupplyByDay, uint256 _mintPrice) {
        initialize(_startTime, _decreaseCoefficient, _totalSupplyByDay, _mintPrice);
    }

    function initialize(uint256 _startTime, uint256 _decreaseCoefficient, uint256 _totalSupplyByDay, uint256 _mintPrice) public initializer {
        __Ownable_init();
        startTime = _startTime;
        decreaseCoefficient = _decreaseCoefficient;
        totalSupplyByDay = _totalSupplyByDay;
        mintPrice = _mintPrice;
        remainingSupply = _totalSupplyByDay;
    }

    // ==================== non-view function ====================

    function offeringIncense() external payable {
        require(msg.value >= mintPrice, "CyberFortuneGod: Insufficient incense money");

        uint256 _days = getDays();

        require(userMintNumByDay[_days][msg.sender] < 3, "CyberFortuneGod: Mint up to three times a day");

        //update supply by day
        if (!updateSupplyByDay[_days]) {
            updateSupplyByDay[_days] = true;
            remainingSupply = totalSupplyByDay;

            emit UpdateSupplyByDay(msg.sender, _days, block.timestamp);
        }

        uint256 _returns = getMintAmount();
        require(_returns > 0, "CyberFortuneGod: The incense money has been distributed out today");

        userMintNumByDay[_days][msg.sender] += 1;

        uint256 _decimals = IMeritCoin(meritCoin).decimals();
        uint256 _mintAmount = 10 ** _decimals * _returns;
        IMeritCoin(meritCoin).mint(msg.sender, _mintAmount);

        emit OfferingIncense(msg.sender, _mintAmount);
    }

    function drawFortune() external {
        uint256 _decimals = IMeritCoin(meritCoin).decimals();
        uint256 _burnAmount = 10 ** _decimals * 5;
        require(IMeritCoin(meritCoin).allowance(msg.sender, address(this)) > 10 ** _decimals * 5, "CyberFortuneGod: Requires 5 Merit Coin");

        IMeritCoin(meritCoin).transferFrom(msg.sender, address(this), _burnAmount);
        IMeritCoin(meritCoin).burn(_burnAmount);

        uint256 _tokenId = IFortuneStick(fortuneStick).draw(msg.sender);
        uint256 _stickNo = IFortuneStick(fortuneStick).getStickNo(_tokenId);

        emit DrawFortune(msg.sender, _tokenId, _stickNo);
    }

    // ==================== view function ====================

    function getDays() public view returns (uint256) {
        return (block.timestamp - startTime) / (24 * 60 * 60);
    }

    // ==================== private function ====================

    function getMintAmount() private returns (uint256 _returns) {
        if (remainingSupply == 0) {
            return 0;
        }

        uint256 _days = getDays();
        uint256 _mintNum = mintNum[_days];
        uint256 _decimals = IMeritCoin(meritCoin).decimals();

        _returns = _mintNum < 4 ? getTop4Amount(_decimals, _mintNum) : (lastDecrement * (10 ** _decimals)) / decreaseCoefficient;

        if (_returns >= remainingSupply) {
            _returns = remainingSupply;
            remainingSupply = 0;
        } else {
            remainingSupply -= _returns;
        }

        lastDecrement = _returns;
        if (_returns > 0) {
            mintNum[_days] = _mintNum + 1;
        }
    }

    function getTop4Amount(uint256 _decimals, uint256 _mintNum) private pure returns (uint256 _returns) {
        if (_mintNum == 0) return 10 ** _decimals * firstMintByDay;
        if (_mintNum == 1) return 10 ** _decimals * secondMintByDay;
        if (_mintNum == 2) return 10 ** _decimals * thirdMintByDay;
        if (_mintNum == 3) return 10 ** _decimals * fourthMintByDay;
    }

    // ==================== owner function ====================

    function initMeritCoin(address _meritCoin) external onlyOwner {
        require(meritCoin == address(0), "CyberFortuneGod: meritCoin has been set");
        meritCoin = _meritCoin;
        emit InitMeritCoin(msg.sender, _meritCoin);
    }

    function withdrawETH(address _to) external onlyOwner {
        uint256 _balance = address(this).balance;
        payable(_to).transfer(_balance);

        emit WithdrawETH(msg.sender, _to, _balance);
    }

    function setTotalSupplyByDay(uint256 _new) external onlyOwner {
        uint256 _old = totalSupplyByDay;
        totalSupplyByDay = _new;
        emit SetTotalSupplyByDay(msg.sender, _old, _new);
    }

    function setMintPrice(uint256 _new) external onlyOwner {
        uint256 _old = mintPrice;
        mintPrice = _new;
        emit SetMintPrice(msg.sender, _old, _new);
    }

    function setDecreaseCoefficient(uint256 _new) external onlyOwner {
        uint256 _old = decreaseCoefficient;
        decreaseCoefficient = _new;
        emit SetDecreaseCoefficient(msg.sender, _old, _new);
    }

    receive() external payable {}
}
