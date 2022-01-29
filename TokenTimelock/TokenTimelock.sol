// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/utils/SafeERC20.sol";

contract Timelock {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private immutable _token;

    // Number of seconds to be added to the current blocktime for token release time
    uint256 private immutable _lockTime;

    // Address for the DAO contract the fee will be sent too
    address private immutable _daoAddress;

    // Address for the DAO contract the fee will be sent too
    address private immutable _burnAddress;

    // Percentage allocation for the DAO of deposited tokens
    uint256 private immutable _daoPercent;

    // Percentage allocation to be burnt of deposited tokens
    uint256 private immutable _burnPercent;

    mapping(address => uint256) public balanceOf; // balances, indexed by addresses
    mapping(address => uint256) public releaseTime; // the release time of the timelock, indexed by addresses

    constructor(
        IERC20 token_,
        uint256 lockTime_,
        address daoAddress_,
        address burnAddress_,
        uint256 daoPercent_,
        uint256 burnPercent_
    ) {
        _token = token_;
        _lockTime = lockTime_;
        _daoAddress = daoAddress_;
        _burnAddress = burnAddress_;
        _daoPercent = daoPercent_;
        _burnPercent = burnPercent_;
    }

    uint256 onePercent; // used to calculate 1% of the deposit amount for contract math
    uint256 reduceAmount; // number used to reduce the funds held in the timelock contract
    uint256 newAmount; // updated amount to modify the deposit amount via previous math
    uint256 daoAmount; // amount to send to the daoAddress based on daoPercentage
    uint256 burnAmount; // amount to send to the burnAddress based on burnPercentage

    function deposit(uint256 amount) public {
        require(amount >= 100); // input amount needs to be minimum of 100 to however many decimal places 
        IERC20(_token).transferFrom(msg.sender, address(this), amount);
        onePercent = amount / 100; // dividing the deposit amount by 100 gives you a relative percentage point to perform further calculations
        reduceAmount = _daoPercent + _burnPercent; // calculation for the total reduction of funds that stays in the timelock contract
        newAmount = 100 - reduceAmount; // calculation for the percentage of funds that remains in the timelock contract 100% minus the reduceAmount
        amount = newAmount * onePercent;
        daoAmount = _daoPercent * onePercent;
        burnAmount = _burnPercent * onePercent;
        releaseTime[msg.sender] = block.timestamp + _lockTime; // set the release time based on the lockTime in constructor
        balanceOf[msg.sender] += amount; // adjust the account's balance
        _token.safeTransfer(_daoAddress, daoAmount);
        _token.safeTransfer(_burnAddress, burnAmount);
    }

    function withdraw(uint256 amount) public {
        require(block.timestamp >= releaseTime[msg.sender]);
        require(amount <= balanceOf[msg.sender]);
        balanceOf[msg.sender] -= amount;
        _token.safeTransfer(msg.sender, amount);
    }
}
