// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(
        string memory name,   // tolen name
        string memory symbol // token symbol
        // uint256 initialSupply // amount of tokens that should be minted after token creation 
    ) ERC20(name, symbol) {
        _mint(msg.sender, 500* 10**18); // token minting
    }
}

