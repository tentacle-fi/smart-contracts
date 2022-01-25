// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TestContract {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    // IERC20 private immutable _token;

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

    //constructor(IERC20 token_, uint256 lockTime_, address daoAddress_, address burnAddress_, uint256 daoPercent_, uint256 burnPercent_) {
    constructor(
        uint256 lockTime_,
        address daoAddress_,
        address burnAddress_,
        uint256 daoPercent_,
        uint256 burnPercent_
    ) {
        // _token = token_;
        _lockTime = lockTime_;
        _daoAddress = daoAddress_;
        _burnAddress = burnAddress_;
        _daoPercent = daoPercent_;
        _burnPercent = burnPercent_;
    }

    function deposit(uint256 amount)
        public
        returns (
            uint256 _inputAmount,
            uint256 _amount,
            uint256 _daoAmount,
            uint256 _burnAmount,
            uint256 _lost
        )
    {
        require(amount >= 100);

        //IERC20(_token).transferFrom(msg.sender, address(this), amount);
        uint256 onePercent = amount / 100;
        uint256 reduceAmount = _daoPercent + _burnPercent;
        uint256 newAmount = (100 - reduceAmount) * onePercent;
        uint256 daoAmount = _daoPercent * onePercent;
        uint256 burnAmount = _burnPercent * onePercent;
        balanceOf[msg.sender] += newAmount; // adjust the account's balance
        releaseTime[msg.sender] = block.timestamp + _lockTime; // set the release time based on the lockTime in constructor
        // _token.safeTransfer(_daoAddress, daoAmount);
        // _token.safeTransfer(_burnAddress, burnAmount);

        _lost = amount - newAmount - daoAmount - burnAmount;

        return (amount, balanceOf[msg.sender], daoAmount, burnAmount, _lost);
    }

    function withdraw(uint256 amount) public {
        require(block.timestamp >= releaseTime[msg.sender]);
        require(amount <= balanceOf[msg.sender]);
        balanceOf[msg.sender] -= amount;
        // _token.safeTransfer(msg.sender, amount);
    }
}
