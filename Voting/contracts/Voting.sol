// SPDX-License-Identifier: MIT
// initially pulled from Ubq at:
// https://raw.githubusercontent.com/ubiq/escher-contracts/master/contracts/vote/EscherVoting.sol

pragma solidity ^0.8.3;

contract Voting {
    struct Voter {
        address sender;
        uint256 candidate;
    }

    struct VoteDetails {
        uint256 startBlock;
        uint256 endBlock;
        string title;
        string desc;
        string[] options;
    }

    mapping(address => uint256) public votes;

    address[] public voters;

    VoteDetails public voteDetails;

    event onVote(address indexed voter, uint256 indexed candidate);

    constructor(
        uint256 startBlock_,
        uint256 endBlock_,
        string memory voteTitle_,
        string memory voteDesc_,
        string[] memory voteOptionsText_
    ) {
        require(startBlock_ > block.number, "startBlock <= current block height");
        require(endBlock_ > startBlock_, "endBlock must be > startBlock");
        require(bytes(voteTitle_).length >= 15, "title < 15 chars. check gas limit for max!");
        require(bytes(voteDesc_).length >= 200, "desc < 200 chars. check gas limit for max!");
        require(voteOptionsText_.length >= 2, "must have 2 or more options");

        for (uint256 i = 0; i < voteOptionsText_.length; i++) {
            require(bytes(voteOptionsText_[i]).length >= 2, "option < 2 chars. check gas limit for max!");
        }

        voteDetails = VoteDetails({startBlock: startBlock_, endBlock: endBlock_, title: voteTitle_, desc: voteDesc_, options: voteOptionsText_});
    }

    function vote(uint256 candidate) public {
        require(candidate != 0, "candidate cannot be zero"); // candidate range is between 1-n
        require(candidate <= voteDetails.options.length, "candidate must be within limits of options (candidate <= options.length)"); // require vote option to be within option range
        require(voteDetails.endBlock == 0 || block.number <= voteDetails.endBlock, "voting is over (block.number > endBlock)");
        require(block.number >= voteDetails.startBlock, "voting not started yet (block.number < startBlock)");

        if (votes[msg.sender] == 0) {
            voters.push(msg.sender);
        }
        votes[msg.sender] = candidate;

        emit onVote(msg.sender, candidate);
    }

    function votersCount() public view returns (uint256 length) {
        return voters.length;
    }

    // get the voters within a range of indexes
    function getVoters(uint256 offset, uint256 limit) public view returns (Voter[] memory results) {
        require(offset < voters.length, "offset must be < total voters aka votersCount()");
        require(limit > 0, "limit must be >= 1");

        uint256 count = 0;
        uint256 resultLength = voters.length - offset > limit ? limit : voters.length - offset;
        results = new Voter[](resultLength);

        for (uint256 i = offset; (i < voters.length) && (count < limit); i++) {
            results[count] = (Voter({sender: voters[i], candidate: votes[voters[i]]}));
            count++;
        }

        return (results);
    }

    function getVoteDetails() public view returns (VoteDetails memory result) {
        return voteDetails;
    }
}
