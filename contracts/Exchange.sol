// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IFactory.sol";
import "./IExchange.sol";

pragma solidity ^0.8.0;

/**
*@title Exchange
* @notice It is an exchange that can convert:
    token => token
    token => ether
    ether => token
*/
contract Exchange is ERC20{

    // token address that will be used for exchange
    address public tokenAddr; 
    // address of the contract that will call the exchange
    address public factoryAddr;


    /**
     * @notice Constructor
     * @param _token - address of the token that would be converted to the other token (or ether)
     * @notice constructor also generes itself LP tokens 
     */
    constructor(address _token) 
    ERC20("Elpishki","LP"){     // LP token for liquidity
        // doesn't allows exchange between unexisted token
        require(_token != address(0), "Incorrect token address");
        // if token address is real it is allowed to use it in this exchange
        tokenAddr = _token;
        factoryAddr = msg.sender;
    }


    ///////// LIQUIDITY ///////////////
    /**
    * @notice function that adds liquidity
    * @param _tokenAmount - amount of token that will create or 
    * complete the liquidity pool
    */

    function addLiquidity(
        uint _tokenAmount
    ) public payable returns(uint){
        // if reserve amount is empy, liquidity pool will be 
        //created in proportion (token - ether) you get
        if(getReserveAmount() == 0){
            IERC20 token = IERC20(tokenAddr);
            token.transferFrom(
                msg.sender, 
                address(this), 
                _tokenAmount
            );

            /**
            * liquidity calculation:
            *  liquidity = amount of transmitted tokens 
            */
            uint liquidity = address(this).balance;
            _mint(msg.sender, liquidity);
            return liquidity;

        } else {
            // if reserve amount isn't empty
            // all we can - to complete this exchange 
            // with corresponding amount of tokenn and ethers
            uint tokenReserve = getReserveAmount();
            uint ethReserve = address(this).balance - msg.value;
            uint tokenAmount = (msg.value * tokenReserve) / ethReserve;

            // token amount should be more or equal then amount of tokens
            // that is needed on the assumption of transmited amount of ethers
            require(_tokenAmount >= tokenAmount, "Not sufficient amount of tokens");

            IERC20 token = IERC20(tokenAddr);
            token.transferFrom(
                msg.sender, 
                address(this), 
                tokenAmount
            );

            /**
            * liquidity calculation:
            *   liquidity = (reserve of tokens * transmitted ethers) / reserve of ethers (without transmited)
            */
            uint liquidity = (totalSupply() * msg.value)/ethReserve;
            _mint(msg.sender, liquidity);
            return liquidity;
        }
    }

    /**
    * @notice function that removes liquidity tokens 
    * @param _amount - amount of token that shoulde be deleted
    */
    function removeLiquidity(
        uint _amount
    ) public returns(uint, uint){
        // user should have liquidity tokens he wants remove
        require(_amount > 0, "Incorrect LP token amount value");

        // calculation of tokens and ethers user would get 
        // after the liquidity tokens burning 
        uint tokenAmount = (getReserveAmount() * _amount) / totalSupply();
        uint ethAmount = (address(this).balance * _amount) / totalSupply();

        // liquidity tokens burning
        _burn(msg.sender, _amount);

        // token and ethers transfer to the user
        ERC20(tokenAddr).transfer(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethAmount);

        return (tokenAmount, ethAmount);
    }

    

    ////// GET...AMOUNT FUNCTIONS ///////////////////////
    // fee = 0.3%

    /**
    * @notice funstion calculates amount of ethers or tokeds
    * depending on the input
    * @param inputAmount - amount of tokens (or ethers) which have to be exchanged
    * @param inputReserve - amount of tokens (or ethers) 
    * (that are the same as inputAmount) exchange pool is holding
    * @param outputReserve - amount of tokens (or ethers) 
    * (that are different from inputAmount) exchange pool is holding
    */
    function getAmount(                                     // is public just in testing time
        uint inputAmount,
        uint inputReserve,
        uint outputReserve
    ) public pure returns(uint) {
        // reserves can't be empty
        require(inputReserve > 0 && outputReserve > 0, "Reserves can't be empty");
        // inputAmount including "taxes"
        uint inputAmountWithFee = inputAmount*997;
        // output amount calculating
        uint firstPart = inputAmountWithFee * outputReserve;
        uint secondPart = inputAmountWithFee + 1000*inputReserve;
        return firstPart/secondPart;
    }

    /**
    * @notice function calculates amount of tokens exchange pool is holding 
    */
    function getReserveAmount() public view returns(uint){

        return IERC20(tokenAddr).balanceOf(address(this));
    }

    /**
    * notice getAmount function where:
    *       inputAmount - amount of ethers which have to be exchanged
    *       inputReserve - amount of ethers exchange pool is holding
    *       outputReserve - amount of tokens exchange pool is holding
    * @return amout of tokens that can be gought with transmitted ethers
    */
    function getTokenAmount( 
        uint _soldEth
    ) public view returns(uint){
        require(_soldEth > 0, "Too small amount of the sold eth");
        uint tokenReserve = getReserveAmount();
        return getAmount(
            _soldEth, 
            address(this).balance, 
            tokenReserve
        );
    }

    /**
    * @notice getAmount function where:
    *        inputAmount - amount of tokens which have to be exchanged
    *        inputReserve - amount of tokens exchange pool is holding
    *        outputReserve - amount of ethers exchange pool is holding
    * @return amout of ethers that can be gought with transmitted tokens
    */
    function getEthAmount(
        uint _soldToken
    ) public view returns(uint){
        require(_soldToken > 0, "Too small amount of tokens");

        uint tokenReserve = getReserveAmount();
        return getAmount(
            _soldToken, 
            tokenReserve, 
            address(this).balance
        );
    }


    ////////// SWAPS ////////////////////
    /**
    * @notice ethers to tokens swap
    * @param _minTokens - minimum of tokens that user agree to buy 
    * @param receiver - user address
    */
    function fromEthToTokens(
        uint _minTokens, address receiver
    ) private {
        // token reserve
        uint tokensAmount = getReserveAmount();  
        // amount of tokens that can be bought by transmitted ethers
        uint boughtTokens = getAmount(          
            msg.value,
            address(this).balance - msg.value,
            tokensAmount
            );

        // calculated amount of tokens must be more or equal minimum amount of tokens that user agree to buy 
        require(_minTokens <= boughtTokens, "Too small amount of tokens");
        IERC20(tokenAddr).transfer(receiver, boughtTokens);
    }

    /**
    * @notice public fromEthToTokens caller, 
    * that transmites msg.sender as a contract
    */
    function fromEthToTokensSwap(
        uint _minTokens
    ) public payable{
            fromEthToTokens(_minTokens, msg.sender);
    }

    /**
    * @notice public fromEthToTokens caller, 
    * that transmites real user address
    */
    function fromEthToTokensTrandfer (
        uint _minTokens, 
        address _receiver
    ) public payable{
            fromEthToTokens(_minTokens, _receiver);
    }


    /**
    * @notice ethers to tokens to ethers swap
    * @param _minEth - minimum amount of ethers that user agree to buy 
    * @param _tokenSold - amoutn of tokens that used want sell
    */
    function fromTokensToEth(
        uint _tokenSold, 
        uint _minEth
    ) public{
        // token reserve
        uint tokensAmount = getReserveAmount();  

        // amount of ethers that can be bought by transmitted tokens
        uint bougthEth = getAmount(
            _tokenSold,
            tokensAmount,
            address(this).balance
            );

        // calculated amount of ethers must be more or equal minimum amount of ethers that user agree to buy
        require(_minEth <= bougthEth, "Not enought amount of tokens");
        
        IERC20(tokenAddr)
        .transferFrom(
            msg.sender, 
            address(this), 
            _tokenSold
        );
        payable(msg.sender).transfer(bougthEth);
    }

    /**
    * @notice function swaps token to token using as intermediate 
    * value amount of calculated ethers
    * @param _soldTokens - amount of tokens user want to sell
    * @param _minBoughtTokens - minimum amount of tokens that user agree to buy 
    * @param _tokenAddressSwapTo - address of token that _soldTokens has to be changed to
    */
    function tokenToTokenSwap(
        uint _soldTokens,
        uint _minBoughtTokens,
        address _tokenAddressSwapTo
    ) public {

        // exchange creatind
        address exchangeAddr = IFactory(factoryAddr).getExchangeAddr(_tokenAddressSwapTo);


        // _soldTokens to ethers swap
        uint256 ethBought = getEthAmount(_soldTokens);
        IERC20(tokenAddr)
        .transferFrom(
            msg.sender, 
            address(this),
            _soldTokens
        );

        // ethers to needed tokens swap
        IExchange(exchangeAddr)
        .fromEthToTokensTrandfer{value: ethBought}(
            _minBoughtTokens, 
            msg.sender
        );

    }
  
}

