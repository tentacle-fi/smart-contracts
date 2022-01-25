const TestContract = artifacts.require("TestContract");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TestContract", function (/* accounts */) {
  it("should be deployed", async function () {
    await TestContract.deployed();
    return assert.isTrue(true);
  });

  it("should do deposit 200 units correctly", async function () {
    const contract = await TestContract.deployed();
    const result = await contract.deposit.call(200);

    console.log("result", {
      amountIn: result._inputAmount.toString(),
      amountToSender: result._amount.toString(),
      dao: result._daoAmount.toString(),
      burn: result._burnAmount.toString(),
      lost: result._lost.toString(),
    });

    assert.isTrue(result._amount.toString() === "196");
    assert.isTrue(result._lost.toString() === "0");
  });

  it("should do deposit 299 units correctly", async function () {
    const contract = await TestContract.deployed();
    const result = await contract.deposit.call(299);

    console.log("result", {
      amountIn: result._inputAmount.toString(),
      amountToSender: result._amount.toString(),
      dao: result._daoAmount.toString(),
      burn: result._burnAmount.toString(),
      lost: result._lost.toString(),
    });

    assert.isTrue(result._amount.toString() === "293");
    assert.isTrue(result._lost.toString() === "0");
  });
});
