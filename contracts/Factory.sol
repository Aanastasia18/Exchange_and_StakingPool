// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Exchange.sol";
import "./IFactory.sol";

/**
 *@title Factory
* @notice It is a factory that adds new exchanges 
* and helps them to interact one another
*/
contract Factory{

    // mapping that save all created exchanges
    mapping(address => address) tokenExchanges;

    /**
    * @notice function that creates new exchanges between ethers and tokens
    * @param _tokenAddr - address of the token that will create new exchange mapping
    */
    function createExchange(
        address _tokenAddr
    ) public returns(address){
        // address of the token shouldn't be empty and exchange with it shouldn't be already created
        require(_tokenAddr != address(0), "Invalid token address");
        require(tokenExchanges[_tokenAddr] == address(0), "This exchange alresdy exists");

        // new exchange creation
        Exchange exchange = new Exchange(_tokenAddr);
        // new echange adding to the tokenExchanges mapping 
        tokenExchanges[_tokenAddr] = address(exchange);

        return tokenExchanges[_tokenAddr];
    }

    /**
     * @notice function that gets the exchange address that can of the necessary token
     * @param _tokenAddr - address of the token which exchange is searched
    */
    function getExchangeAddr(
        address _tokenAddr
    ) public view returns(address){
        // exchange must exist
        require(tokenExchanges[_tokenAddr] != address(0), "This exchange doesn't exist");
        
        return tokenExchanges[_tokenAddr];
    }

 }































// contract Factory {
//     mapping (address => address) tokenToExchange;

//     function createExchange(address _tokenAddress) public returns(address){
//         require(_tokenAddress != address(0), "Incorrect token address");
//         require(tokenToExchange[_tokenAddress] == address(0), "This birja already exists");

//         Exchange exchange = new Exchange(_tokenAddress);
//         tokenToExchange[_tokenAddress] = address(exchange);
//         return address(exchange);
//     }

//     function getExchange(address _tokenAddress) public view returns(address){
//         return tokenToExchange[_tokenAddress];
//     }
// } 