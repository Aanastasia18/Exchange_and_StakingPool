# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

Version
=======
> solidity-coverage: v0.7.21

Instrumenting for coverage...
=============================

> Exchange.sol
> Factory.sol
> IExchange.sol
> IFactory.sol
> StakingPool.sol
> Token.sol

Compilation:
============

Nothing to compile

Network Info
============
> HardhatEVM: v2.10.1
> network:    hardhat



  Exchange
    ✔ Returns an error if token.address which was sent to the contract is zeroAddress (48ms)
    exchange constructor
      ✔ it doesn't allows empty token address (113ms)
    getAmount
      ✔ Returns an error if inputReserve or outputReserve equals to 0 (66ms)
      ✔ Gets the correct amount (67ms)
    getReserveAmount
      ✔ Correctly computes getReserveAmount (96ms)
    getTokenAmount
      ✔ Correctly computes getTokenAmount, otherwise it calls an error (78ms)
    getEthAmount
      ✔ Correctly computes getEthAmount, otherwise it calls an error (69ms)
    addLiquidity
      ✔ allows zero token amount liquidity (51ms)
      ✔ adds new coins for liquidity (with zero reserve) (52ms)
      ✔ adds new coins for liquidity (with no empty reserve) (97ms)
      ✔ doesn't adds new coins for liquidity (with no empty reserve) if the amount of eth is zero (80ms)
      ✔ adds the mount of tokens corresponding to the transferred amount of ethers. (80ms)
      ✔ Reverts an error if amount of tokens wouldn't enough (65ms)
      ✔ reverts if amount of added tokens is not sufficient (63ms)
      ✔ mints LP tokens (110ms)
      ✔ Emits an event which means that transaction has been successfully spent (49ms)
    removeLiquidity
      ✔ Reverts an error if removed amount equals 0 (39ms)
      ✔ Correctly removes liquidity (219ms)
      ✔ Removes all liquidity (98ms)
      ✔ burns LP tokens of the message sender (64ms)
    fromEthToTokensSwap
      ✔ Reverts an error if _minEth are more then bougthEth (64ms)
      ✔ Adds the correct receiver address and amount to the emited event (48ms)
    fromEthToTokensTrandfer
      ✔ Adds the correct sender address and amount to the emited event (65ms)
      ✔ Changes the balances of user and contract exchange (78ms)
      ✔ Doesn't allow other users to burn tokens using address(0) as receiver (62ms)
    fromTokensToEth
      ✔ Returns error, if minimum amount of eth is less then we can buy using our tokens (63ms)
      ✔ Checks if balances of tokens are correctly changed after realising fromTokensToEth function (77ms)
      ✔ Checks if balances of ethers are correctly changed after realising fromTokensToEth function (79ms)
      ✔ Checks if are emited 2 different transfer events: tokens to the exchange contract and ethers to the message sender contract (92ms)
    tokenToTokenSwap
      ✔ Returns an error if mapping tokenExchanges with the set token address doesn't exists
      ✔ Correctly swaps token to token (517ms)

  Factory
    createExchange
      ✔ Returns an error if token address is empty
      ✔ Reverts an error if exchange already exists
      ✔ creates exchanges (96ms)
      ✔ reverts an error from getExchange is exchange doesn't exists

  StakingPool
    constructor
      ✔ Should return correct data about RWD and LP tokens (96ms)
    firstDeposit
      ✔ reverts a mistake when the user is not owner 
      ✔ checks if the firstDeposit function emits UpdatedTokenDeposit event
      ✔ Makes correct changes in owner's userAbout structure (80ms)
    rewardingTokenSupply
      ✔ Should show the amount of reward tokens that are in contract 
    partialLPDeposit
      ✔ Reverts with an error if amount of RWD tokens are less then 1
      ✔ changes amount and timestamp (increases) (81ms)
      ✔ Emites a new UpdatedTokenDeposit event
    depositeAllLPTokens
      ✔ Correctly calls the partialLPDeposit and transfers it as amount total supply of the users LP tokens  (78ms)
    partialWithdrawOfLPTokens
      ✔ Reverts with an error if amount of LP tokens are less then sent amount parameter (71ms)
      ✔ Changes user amount in the userAbout structure (decreases) (95ms)
      ✔ Increases personal LP token user pool (96ms)
      ✔ Emits transaction TokenWithdraw (93ms)
    withdrawAllLPTokens
      ✔ Reverts with an error if amount of LP tokens equals to 0 (102ms)
      ✔ Should set amount in user info as 0 (96ms)
      ✔ should transfer all LP tokens to the msg.sender (95ms)
      ✔ Emits transaction TokenWithdraw (76ms)
    updatingReward
      ✔ Checks if the structure reward, weight, timestamp, startBlock parameters change (126ms)
    partialWithdrawOfRewardTokens
      ✔ Returns an error if user doesn't have reward tokens


  54 passing (15s)

------------------|----------|----------|----------|----------|----------------|
File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts\       |    94.02 |     88.1 |    93.94 |    93.33 |                |
  Exchange.sol    |      100 |      100 |      100 |      100 |                |
  Factory.sol     |      100 |      100 |      100 |      100 |                |
  IExchange.sol   |      100 |      100 |      100 |      100 |                |
  IFactory.sol    |      100 |      100 |      100 |      100 |                |
  StakingPool.sol |    87.72 |    72.22 |    88.89 |    86.67 |... 215,217,218 |
  Token.sol       |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|
All files         |    94.02 |     88.1 |    93.94 |    93.33 |                |
------------------|----------|----------|----------|----------|----------------|



[![built-with openzeppelin](https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF)](https://docs.openzeppelin.com/)
