// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// User can consume MERIT to draw new fortune stick.
// Each fortune stick will record the original drawer and the draw time, which will not be changed when transferring
contract FortuneStick is Ownable, ERC721Enumerable {
    using Strings for uint256;
    using Strings for address;

    address public immutable minter;

    string public baseURI;

    // tokenId => mint timestamp
    mapping(uint256 => uint256) public mintTime;

    event SetBaseURI(address _sender, string _old, string _new);

    constructor(address _minter, string memory _baseURI_) Ownable() ERC721("Fortune Stick", "FS") {
        minter = _minter;
        baseURI = _baseURI_;
    }

    // ==================== non-view function ====================
    function draw(address _to) external returns (uint256 _tokenId) {
        require(msg.sender == minter, "FortuneStick: You are not minter");

        _tokenId = totalSupply();

        mintTime[_tokenId] = block.timestamp;
        _safeMint(_to, _tokenId);
    }

    // ==================== view function ====================

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        address _owner = ownerOf(_tokenId);
        uint256 _stickNo = getStickNo(_tokenId);

        return
            bytes(_baseURI()).length > 0
                ? string(abi.encodePacked(_baseURI(), "/", _tokenId.toString(), "/", _stickNo.toString(), "_", _owner.toHexString(), "_", mintTime[_tokenId].toString(), ".json"))
                : "";
    }

    function getStickNo(uint256 _tokenId) public view returns (uint256) {
        address _owner = ownerOf(_tokenId);
        uint256 _mintTime = mintTime[_tokenId];

        return uint256(keccak256(abi.encodePacked(address(this), _tokenId.toString(), _owner, _mintTime.toString()))) % 61;
    }

    // ==================== private function ====================

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // ==================== owner function ====================

    function setBaseURI(string memory _new) external onlyOwner {
        string memory _old = baseURI;
        baseURI = _new;
        emit SetBaseURI(msg.sender, _old, _new);
    }
}
