# smart-contracts

## Getting Started Testing

```
# from root of git repo
npm install

# test the contract in testing/ (see package.json for full command details)
npm run test

# pretty up any code in js or solidity!
npm run lint
```

### Files of interest:

`testing/test/test_1.js` this file is where to write the JS tests to execute against the contract
`testing/contracts/TestContract.sol` the contract under test, deployed locally, for free

### Current Limitations:

`ERC20` and other parts of the openzeppelin contract library were imported, but never actually used during the tests (the code needed to be disabled for token transfers due to how to constructor call errors). a new attempt could be tried to enable this, which might also allow testing to act like the real network.

NOTE: as always, REAL NETWORK TESTING is the final, best solution that also costs fake/real tokens+gas!

## Unnecessary for testing:

```
# initially ganache was installed and seemingly used
# tests run now without this dependency (somehow?!)
npm install ganache --save

# to run ganache (a test rpc hosted locally):
npx ganache
```
