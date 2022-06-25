// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Painter is ERC20PresetMinterPauser, Ownable, ReentrancyGuard {
    struct canvasState {
        uint256 pixelLocation;
        uint256 color;
    }

    uint256[] public canvasStates;

    uint256 public brushPrice = 10**17; // default brush price set to 0.1 (18 decimals)
    address public immutable _daoAddress;

    event painted(address brushHolder, uint256 pixelPainted, uint256 colorUsed);

    constructor(address daoAddress_) ERC20PresetMinterPauser("Brush", "BRS") {
        _daoAddress = daoAddress_;
    }

    // Contract owner is able to set the price of the brushes

    function setBrushPrice(uint256 _brushPrice) public onlyOwner {
        brushPrice = _brushPrice;
    }

    // Function for minting brushes

    function mintBrush(uint256 mintAmount) public payable nonReentrant {
        // tx.origin here is a valid use-case.
        // solhint-disable-next-line avoid-tx-origin
        require(msg.sender == tx.origin, "contracts not allowed"); // transaction must not originate from a contract
        require(msg.value == brushPrice * mintAmount); // transaction value must equal the set brush price and the desired mint quantitiy
        _mint(msg.sender, 10**18 * mintAmount); // 1 BRS token sent to send of the function call, per minted number (18 decimal token)
    }

    // Burn minted brush and push into array

    function useBrush(uint256 pixelLocation, uint256 color) public {
        _burn(msg.sender, 10**18); // burn 1 brush token
        canvasStates.push(pixelLocation); // push pixelLocation into array
        canvasStates.push(color); // push color into array
        emit painted(msg.sender, pixelLocation, color);
    }

    // Returns the array length

    function arrayLength() public view returns (uint256 length) {
        return canvasStates.length;
    }

    // Reports on contents of array based on the selected length (how many array entries to report on)
    // as well as offset (from what position in the array should we report on. 0 = beginning of array)

    function reportArray(uint256 offset, uint256 limit) public view returns (canvasState[] memory results) {
        require(offset < canvasStates.length, "offset must be < total array entries aka arrayLength()");
        require(limit > 0, "limit must be >= 1");

        uint256 count = 0;
        uint256 resultLength = canvasStates.length - offset > limit ? limit : canvasStates.length - offset;
        results = new canvasState[](resultLength);

        for (uint256 i = offset; (i < canvasStates.length) && (count < limit); i++) {
            results[count] = (canvasState({pixelLocation: canvasStates[i], color: canvasStates[i]}));
            count++;
        }
        return (results);
    }

    // Contract owner(s) able to withdraw any funds paid into the contract

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(_daoAddress).balance}("");
        require(success);
    }
}
