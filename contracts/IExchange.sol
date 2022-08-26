// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IExchange{

    function addLiquidity(uint _tokenAmount) external payable returns(uint);

    function getReserveAmount() external view returns(uint);

    function getTokenAmount( uint _soldEth) view external returns(uint);

    function getEthAmount(uint _soldToken) external view returns(uint);

    function fromEthToTokens(uint _minTokens) external payable;

    function fromEthToTokensTrandfer(uint _minTokens, address _receiver) external payable;

    function fromTokensToEth(uint _tokenSold, uint _minEth) external;

    function removeLiquidity(uint _amount) external returns(uint, uint);

    function tokenToTokenSwap(uint _firstTokenSold, uint _secongMinTokenBought, address _secondTokenAddress) external;

    // function addLiquidity(uint256 _tokenAmount) external payable returns(uint);

    // function getReserve() external view returns (uint256);

    // function getTokenAmount(uint _ethSold) external view returns(uint);

    // function getEthAmount(uint _tokenSold) external view returns(uint);

    // function ethToTokenSwap(uint _minTokens) external payable;

    // function ethToTokenTransfer(uint _minTokens, address _recipient) external payable;

    // function tokenToEthSwap(uint _minEth, uint _tokenSold) external payable;

    // function removeLiquidity(uint _amount) external returns(uint, uint);

    // function tokenToTokenSwap(uint _tokenSold, uint _minTokensBought, address _tokenAddress) external;
}

