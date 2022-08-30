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
      ✔ Correctly computes getReserveAmount (100ms)
    getTokenAmount
      ✔ Correctly computes getTokenAmount, otherwise it calls an error (69ms)
    getEthAmount
      ✔ Correctly computes getEthAmount, otherwise it calls an error (68ms)
    addLiquidity
      ✔ allows zero token amount liquidity (53ms)
      ✔ adds new coins for liquidity (with zero reserve) (49ms)
      ✔ adds new coins for liquidity (with no empty reserve) (99ms)
      ✔ doesn't adds new coins for liquidity (with no empty reserve) if the amount of eth is zero (82ms)
      ✔ adds the mount of tokens corresponding to the transferred amount of ethers. (128ms)
      ✔ Reverts an error if amount of tokens wouldn't enough (107ms)
      ✔ reverts if amount of added tokens is not sufficient (91ms)
      ✔ mints LP tokens (115ms)
      ✔ Emits an event which means that transaction has been successfully spent (50ms)
    removeLiquidity
      ✔ Reverts an error if removed amount equals 0 (56ms)
      ✔ Correctly removes liquidity (206ms)
      ✔ Removes all liquidity (127ms)
      ✔ burns LP tokens of the message sender (83ms)
    fromEthToTokensSwap
      ✔ Reverts an error if _minEth are more then bougthEth (70ms)
      ✔ Adds the correct receiver address and amount to the emited event (62ms)
    fromEthToTokensTrandfer
      ✔ Adds the correct sender address and amount to the emited event (78ms)
      ✔ Changes the balances of user and contract exchange (95ms)
      ✔ Doesn't allow other users to burn tokens using address(0) as receiver (62ms)
    fromTokensToEth
      ✔ Returns error, if minimum amount of eth is less then we can buy using our tokens (61ms)
      ✔ Checks if balances of tokens are correctly changed after realising fromTokensToEth function (77ms)
      ✔ Checks if balances of ethers are correctly changed after realising fromTokensToEth function (77ms)
      ✔ Checks if are emited 2 different transfer events: tokens to the exchange contract and ethers to the message sender contract (154ms)
    tokenToTokenSwap
      ✔ Returns an error if mapping tokenExchanges with the set token address doesn't exists (46ms)
      ✔ Correctly swaps token to token (586ms)

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
      ✔ reverts a mistake when the user has already deposited his funds  (58ms)
      ✔ checks if the firstDeposit function emits UpdatedTokenDeposit event (45ms)
      ✔ Makes correct changes in owner's userAbout structure (63ms)
    Main part
      rewardingTokenSupply
        ✔ Should show the amount of reward tokens that are in contract 
      partialLPDeposit
        ✔ Reverts with an error if amount of RWD tokens are less then 1
        ✔ changes amount and timestamp (increases) (79ms)
        ✔ Emites a new UpdatedTokenDeposit event
        ✔  (83ms)
      depositeAllLPTokens
        ✔ Correctly calls the partialLPDeposit and transfers it as amount total supply of the users LP tokens  (63ms)
      partialWithdrawOfLPTokens
        ✔ Reverts with an error if amount of LP tokens are less then sent amount parameter (71ms)
        ✔ Changes user amount in the userAbout structure (decreases) (96ms)
        ✔ Increases personal LP token user pool (96ms)
        ✔ Emits transaction TokenWithdraw (78ms)
      withdrawAllLPTokens
        ✔ Reverts with an error if amount of LP tokens equals to 0 (71ms)
        ✔ Should set amount in user info as 0 (99ms)
        ✔ Returns an error if user doesn't have reward tokens
        ✔ transfers a part from reward tokens to the owner (127ms)
      withdrawAllRewardTokens
        ✔ transfers all reward tokens to the owner (207ms)
      withdrawAllTokens
        ✔ transfers all reward and LP tokens to the owner (158ms)


  59 passing (18s)

------------------|----------|----------|----------|----------|----------------|
File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts\       |      100 |      100 |      100 |      100 |                |
  Exchange.sol    |      100 |      100 |      100 |      100 |                |
  Factory.sol     |      100 |      100 |      100 |      100 |                |
  IExchange.sol   |      100 |      100 |      100 |      100 |                |
  IFactory.sol    |      100 |      100 |      100 |      100 |                |
  StakingPool.sol |      100 |      100 |      100 |      100 |                |
  Token.sol       |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|
All files         |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json