# TokenTimelock

## Desciption

A contract designed to lock ERC20 tokens for a set period of time. Lock time and ERC20 token to be used is selected at contract deployment.

## Installation

Install via Remix. Copy file contents https://github.com/tentacle-fi/smart-contracts/blob/main/TokenTimelock/TokenTimelock.sol into a new solidity file and compile on solidity version 0.8.1 or above to solidity version 0.8.X

## Deployment

Deployment of TokenTimelock.sol requires the following constructor settings:

**token**: ERC20 basic token contract address for the token you wish to use
      
**locktime**: Number of seconds to be added to the current blocktime for token release time. e.g. if you fill this in with '600', it will take the current blocktime of the most recent block and add 600 seconds to it for the release time. Once this release time passes the user can withdraw any funds.

**daoAddress**: To specify an address for the DAO contract the fee will be sent too. Funds sent to this address are based on a percentage determined by daoPercent.

**burnAddress**: To specify a burn address for the DAO contract the fee will be sent too. Funds sent to this address are based on a percentage determined by burnPercent.

**daoPercent**: Percentage allocation for the DAO address of deposited tokens. Setting this to over 100 combined with the burnPercent will cause the contract functions to fail.

**burnPercent**: Percentage allocation burn the burn address of deposited tokens. Setting this to over 100 combined with the daoPercent will cause the contract functions to fail.

## Usage

Once the contract has been deployed, any user can interact with its functions. The only variable that can be set by a user is the deposit amount. All deposits are matched against the deposing address and are only available for withdrawal after the current blocktime passes the release time.

Tokens sent to the DAO or burn addresses are done so automatically upon deposit by the contract.