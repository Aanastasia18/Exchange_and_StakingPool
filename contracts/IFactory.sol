// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFactory {
    function getExchangeAddr(address _tokenAddress) external returns(address);
}