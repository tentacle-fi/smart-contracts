# smart-contracts

## Getting Started Testing

```
# from root of git repo
yarn install

# test the contract in testing/ (see package.json for full command details)
yarn test

# or to test the Voting contract(s)
yarn voting

# to generate a test coverage report, append _coverage to the testing command
yarn voting_coverage

# compile the contract (create ABI json), append _compile to the testing command
yarn voting_compile

# package.json can be setup to run solhint to 'eslint' for problems in the solidity code
yarn voting_eslint

# pretty up any code in js or solidity!
yarn lint
```

### Files of interest:

NOTE: to ensure testing will work properly, a `test/` folder must be present with the file `test_1.js`

`testing/test/test_1.js` this file is where to write the JS tests to execute against the contract
`testing/contracts/TestContract.sol` the contract under test, deployed locally, for free

### Current Limitations:

`ERC20` and other parts of the openzeppelin contract library were imported, but never actually used during the tests (the code needed to be disabled for token transfers due to how to constructor call errors). a new attempt could be tried to enable this, which might also allow testing to act like the real network.

NOTE: as always, REAL NETWORK TESTING is the final, best solution that also costs fake/real tokens+gas!

## Unnecessary for testing:

```
# initially ganache was installed and seemingly used
# tests run now without this dependency (somehow?!)
yarn add ganache

# to run ganache (a test rpc hosted locally):
npx ganache
```
