const TestContract = artifacts.require("TestContract");

module.exports = function (deployer) {
  deployer.deploy(
    TestContract,
    500,
    "0x91f646CA1bC629cd1398076998D54e1429e83Cc1", // pulled from ganache when started
    "0x75e3FFE46e9A7677e904f02112D554aEb96Dc8C4", // pulled from ganache when started
    1,
    1
  );
};
