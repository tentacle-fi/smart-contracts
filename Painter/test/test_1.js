// docs at:
// https://trufflesuite.com/docs/truffle/reference/contract-abstractions.html
const PainterContract = artifacts.require("painter");

// docs at:
// https://docs.openzeppelin.com/test-helpers/0.5/api#intransaction
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

// contract constructor values
const initialDeployedValues = {
  daoAddress_: "0x0",
};

// make the lorem ipsum text super long
initialDeployedValues.desc +=
  initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc + initialDeployedValues.desc;

let deployedValues = { ...initialDeployedValues };

// console.log("deployedValues.desc.length", deployedValues.desc.length);

contract("PainterContract", function (accounts) {
  // contract under test 'global' variable
  let Contract;

  beforeEach(async function () {
    deployedValues = {
      daoAddress_: accounts[0],
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
        // set other defaults here as needed
        gas: 11510000,
      };
    }
    return PainterContract.new(values.daoAddress_, txOptions);
  }

  describe("test valid constructor params", function () {
    it("should be deployed", async function () {
      return assert.isTrue(Contract !== undefined);
    });

    it("test _daoAddress matches constructor params", async function () {
      const _daoAddress = await Contract._daoAddress();
      expect(_daoAddress).to.equal(deployedValues.daoAddress_);
      expect(_daoAddress).to.not.equal(undefined);
    });
  });
});
