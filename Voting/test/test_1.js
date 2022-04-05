// docs at:
// https://trufflesuite.com/docs/truffle/reference/contract-abstractions.html
const VoteContract = artifacts.require("Voting");

// docs at:
// https://docs.openzeppelin.com/test-helpers/0.5/api#intransaction
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

// contract constructor values
const initialDeployedValues = {
  startBlock: 5,
  endBlock: 15,
  title: "Descriptive Test Vote Title",
  desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
  options: ["option 1", "my option 2", "option num 3 (index 2)"],
};

// make the lorem ipsum text super long
initialDeployedValues.desc +=
  initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc;

let deployedValues = { ...initialDeployedValues };

// console.log("deployedValues.desc.length", deployedValues.desc.length);

contract("VoteContract", function (accounts) {
  // contract under test 'global' variable
  let Contract;

  beforeEach(async function () {
    // the testnet block chain doesn't reset between runs,
    // so the starblock for each deployment needs to be accounted
    // for with the current block height
    const currentBlockNumber = (await web3.eth.getBlock("latest")).number;

    deployedValues = {
      ...deployedValues,
      startBlock: currentBlockNumber + initialDeployedValues.startBlock,
      endBlock: currentBlockNumber + initialDeployedValues.endBlock,
    };

    // deploy the vote contract before each test
    await deployNewContract(deployedValues);
  });

  async function deployNewContract(values, txOptions) {
    Contract = undefined; //reset
    Contract = await newContract({ ...values }, txOptions);
  }
  async function newContract(values, txOptions) {
    if (txOptions === undefined) {
      // default
      txOptions = {
        gas: 11510000,
      };
    }
    return VoteContract.new(values.startBlock, values.endBlock, values.title, values.desc, values.options, txOptions);
  }

  async function sendVote(candidate, accountNum) {
    return Contract.vote(candidate, { from: accounts[accountNum] });
  }

  // vote, test that the event was properly emitted and the candidate is set correctly
  async function testVote(candidate, accountNum) {
    const vote = await sendVote(candidate, accountNum);

    const voters = await Contract.getVoters(0, deployedValues.options.length);
    expect(voters[accountNum].sender).to.equal(accounts[accountNum]);
    expect(parseInt(voters[accountNum].candidate)).to.equal(candidate);

    const expectedEventValues = { voter: accounts[accountNum], candidate: new BN(candidate) };
    await expectEvent.inTransaction(vote.tx, Contract, "onVote", expectedEventValues);
  }

  describe("test valid constructor params", function () {
    it("should be deployed", async function () {
      return assert.isTrue(Contract !== undefined);
    });

    it("test getVoteDetails() matches constructor values", async function () {
      const contractDetails = await Contract.getVoteDetails();
      expect(contractDetails.title).to.equal(deployedValues.title);
      expect(contractDetails.desc).to.equal(deployedValues.desc);

      expect(contractDetails.options.length).to.equal(deployedValues.options.length);

      for (let i = 0; i < deployedValues.options.length; i++) {
        expect(contractDetails.options[i]).to.equal(deployedValues.options[i]);
      }
    });

    it("should have event in constructor", async function() {
      await expectEvent.inConstruction(Contract, "onNewBallot", {});
    })
  });

  describe("test voting at valid block height & onVote() event emitted", function () {
    it("test zero votes exist on startup", async function () {
      const votersCount = await Contract.votersCount();

      expect(votersCount.toNumber()).to.equal(0);
    });

    it("test one vote", async function () {
      await ffBlocks(initialDeployedValues.startBlock);

      await testVote(2, 0);
    });

    it("test two votes", async function () {
      await ffBlocks(initialDeployedValues.startBlock);

      await testVote(2, 0);
      await testVote(3, 1);
    });

    it("test two voters with multiple votes each", async function () {
      await ffBlocks(initialDeployedValues.startBlock);

      await testVote(2, 0);
      await testVote(3, 1);
      await testVote(1, 0); //changed vote intentionally
      await testVote(2, 1); //changed vote intentionally
    });
  });

  describe("test constructor revert conditions", function () {
    it("expect revert when start block is in the past", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          startBlock: 1,
        }),
        "startBlock <= current block height"
      );
    });

    it("expect revert when end block is in the past", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          endBlock: 1,
        }),
        "endBlock must be > startBlock"
      );
    });

    it("expect revert when title is short", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          title: "",
        }),
        "title < 15 chars. check gas limit for max!"
      );
      await expectRevert(
        newContract({
          ...deployedValues,
          title: "hi",
        }),
        "title < 15 chars. check gas limit for max!"
      );
    });

    it("expect revert when desc is short", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          desc: "hi",
        }),
        "desc < 200 chars. check gas limit for max!"
      );
    });

    it("expect revert when too few options", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          options: ["hi"],
        }),
        "must have 2 or more options"
      );
      await expectRevert(
        newContract({
          ...deployedValues,
          options: [],
        }),
        "must have 2 or more options"
      );
    });

    it("expect revert when valid num of options but too short of option text", async function () {
      await expectRevert(
        newContract({
          ...deployedValues,
          options: ["yes", "no", "h"],
        }),
        "option < 2 chars. check gas limit for max!"
      );
      await expectRevert(
        newContract({
          ...deployedValues,
          options: ["ha", "", "1"],
        }),
        "option < 2 chars. check gas limit for max!"
      );
    });
  });

  describe("test vote revert conditions", function () {
    it("expect revert when candidate is zero", async function () {
      await expectRevert(sendVote(0, 0), "candidate cannot be zero");
    });

    it("expect revert when candidate is > options limit", async function () {
      await expectRevert(sendVote(deployedValues.options.length + 1, 0), "candidate must be within limits of options (candidate <= options.length)");
    });

    it("expect revert when voting has not started yet", async function () {
      await expectRevert(sendVote(2, 0), "voting not started yet (block.number < startBlock)");
    });

    it("expect revert when voting is over", async function () {
      await ffBlocks(deployedValues.endBlock + 1);
      await expectRevert(sendVote(2, 0), "voting is over (block.number > endBlock)");
    });
  });

  describe("test getVoters require conditions", function () {
    it("expect revert when offset > total votes", async function () {
      await expectRevert(Contract.getVoters(1, 1), "offset must be < total voters aka votersCount()");
      await expectRevert(Contract.getVoters(0, 1), "offset must be < total voters aka votersCount()");
    });

    it("expect revert when limit = 0", async function () {
      await ffBlocks(initialDeployedValues.startBlock);
      await testVote(1, 0);

      await expectRevert(Contract.getVoters(0, 0), "limit must be >= 1");
    });
  });
});

// helper function to fast forward a number of blocks on chain
const ffBlocks = (total) => {
  return new Promise(async (resolve, reject) => {
    let currentBlockNumber = 0;
    let loopCount = 0;
    while (loopCount < total) {
      // if (currentBlockNumber >= height) {
      //   break;
      // }

      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_mine",
          id: new Date().getTime(),
        },
        (err, result) => {
          if (err) {
            return reject(err);
          }
          // console.log("block height successfully uppped", result);
        }
      );

      currentBlockNumber = (await web3.eth.getBlock("latest")).number;

      loopCount++;
    }

    return resolve(currentBlockNumber);
  });
};
