// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./Exchange.sol";
import "./Factory.sol";

/**
* @title StakingPool
* @notice It is staking pool 
*/
contract StakingPool{
    
    address public tokenAddress; 
    using SafeERC20 for IERC20;
    
    // event that must be emited when tokens were claimed 
    event TokenWithdraw( address indexed user, uint amount);

    // event that must be emited when deposit was just created or replenished 
    event UpdatedTokenDeposit (address indexed user, uint amount);

    struct UserAbout{
        uint amount;    // amount of user's LP tokens
        uint reward;    // amount of user's reward tokens
        uint timestamp; // time that user is staking tokens 
        uint weight;    // grows in direct proportion to staking time
        uint startBlock; // block that user started staking tokens
    }
 
    // FOR TESTING ////////
    function getUserAmount() public view returns(uint){
        return userAbout[msg.sender].amount;
    }

    function getStartBlock() public view returns(uint){
        return userAbout[msg.sender].startBlock;
    }

    function getWeight() public view returns(uint){
        return userAbout[msg.sender].weight;
    }

    function getTimestamp() public view returns(uint){
        return userAbout[msg.sender].timestamp;
    }

    function getUserReward() public view returns(uint){
        return userAbout[msg.sender].reward;
    }

    // user whose funds are represented
    address public owner;

    // minimum amount of tokens to deposit
    uint private constant MIN = 10**18;

    // one day in seconds
    uint private constant MINUTE = 60;
    uint private constant SEC = 1;
    uint private constant HOUR = 3600;

    // minimum reward that staker can get per day
    uint private constant MIN_REWARD_PER_DAY = 10**18;

    // RWD token object
    IERC20 public immutable rewardingToken;

    // LP token object
    IERC20 public immutable stakedToken;

    // accuracy in token reward calculating
    uint private constant ACCURACY = 10**14;

    // information about each user that stakes his/her tokens
    mapping (address => UserAbout) public userAbout;

    // locker for users that had already deposited funds
    bool public lock;

    /**
     * @notice Constructor
     * @param rewardTokenAddress reward token address
     * @param lpAddress token for stake
     */
    constructor(address lpAddress, address rewardTokenAddress){
        stakedToken = IERC20(lpAddress);
        rewardingToken = IERC20(rewardTokenAddress);
        lock = false;
        owner = msg.sender;
    }

    /**
    * @notice modifier locker forbids the access to the firstDeposit
    *           if it was called more then once
    */
    modifier locker(){
        require(lock == false, "User has already deposited funds");
        _;
        lock = true;
    }

    /**
    * @notice modifier onlyOwner prevents the access to the to the functions 
    *           if user is not the msg.sender
    */
    modifier onlyOwner(){
        require(owner == msg.sender, "Not the owner!");
        _;
    }

    /**
     * @notice firstDeposit that can be called by owner
     * @param amount - amount of tokens to deposit
     */
    function firstDeposit(uint amount)
    public
    onlyOwner
    locker {
        SafeERC20.safeTransferFrom(rewardingToken, msg.sender, address(this), amount);
        userAbout[msg.sender].weight = 1;
        userAbout[msg.sender].startBlock = 1;
        emit UpdatedTokenDeposit(msg.sender, amount);
    }

    // total amount of rewardingTokens in the contract
    function rewardingTokenSupply() public view returns(uint){
        return rewardingToken.balanceOf(address(this));
    }

    /**
     * @notice partialLPDeposit function that adds specified amount of lpTpkens 
     * in the staking pool
     */
    function partialLPDeposit(uint amount)
    public {
        require(amount >= MIN, "Deposite amount minimum 1 LP!");
        userAbout[msg.sender].amount +=  amount;
        userAbout[msg.sender].timestamp = block.timestamp;

        SafeERC20.safeTransferFrom(stakedToken, msg.sender, address(this), amount);

        if(userAbout[msg.sender].weight == 0){
            userAbout[msg.sender].weight = 1;
            userAbout[msg.sender].startBlock = block.number;
        }

        emit UpdatedTokenDeposit(msg.sender, amount);
    }

    /**
     * @notice depositeAllLPTokens function that adds all amount of lpTpkens 
     * in the staking pool
     */
    function depositeAllLPTokens()
    public {
        uint amount = stakedToken.balanceOf(msg.sender);
        partialLPDeposit(amount);
    }

    function withdrawAllTokens()
    public
    onlyOwner{
        withdrawAllRewardTokens();
        withdrawAllLPTokens();
    }

    /**
     * @notice depositeAllLPTokens function that removes all amount of lpTpkens 
     * from the staking pool and transfers them to the msg.sender
     */
    function withdrawAllLPTokens()
    public {
        uint tokenLPAmount = userAbout[msg.sender].amount;
        require(tokenLPAmount > 0, "Don't have enough LPs in pool");
        
        unchecked {
            userAbout[msg.sender].amount -= tokenLPAmount;
        }

        updatingReward(msg.sender);
        SafeERC20.safeTransfer(stakedToken, msg.sender, tokenLPAmount);
        emit TokenWithdraw(msg.sender, tokenLPAmount);
    }

    /**
     * @notice depositeAllLPTokens function that removes specified amount of lpTpkens 
     * from the staking pool and transfers them to the msg.sender
     */
    function partialWithdrawOfLPTokens(uint amount)
    public{
        uint tokenLPAmount = userAbout[msg.sender].amount;
        require(tokenLPAmount >= amount, "Don't have enough LPs in pool");
        
        unchecked {
            userAbout[msg.sender].amount -= amount;
        }

        updatingReward(msg.sender);

        SafeERC20.safeTransfer(stakedToken, msg.sender, amount);

        emit TokenWithdraw(msg.sender, amount);
    }

    /**
     * @notice withdrawAllRewardTokens function that removes all amount of RWD tokens 
     * from the staking pool and transfers them to the msg.sender
     */
    function withdrawAllRewardTokens()
    public {

        uint rewardTokenAmount = userAbout[msg.sender].reward;
        partialWithdrawOfRewardTokens(rewardTokenAmount);
    }

    /**
     * @notice partialWithdrawOfRewardTokens function that removes specified amount of RWD tokens 
     * from the staking pool and transfers them to the msg.sender
     */
    function partialWithdrawOfRewardTokens(uint amount)
    public{
        uint tokenRWDAmount = userAbout[msg.sender].reward;
        require(tokenRWDAmount >= amount, "Don't have enough RWDs in pool");
        
        unchecked {
            userAbout[msg.sender].reward -= amount;
        }

        updatingReward(msg.sender);

        SafeERC20.safeTransfer(rewardingToken, msg.sender, amount);

        emit TokenWithdraw(msg.sender, amount);
    }

    /**
     * @notice updatingReward updates amount of RWD token when user 
     * does one of the LP token withdraw transactions 
     */    
    function updatingReward(address user)
    public{
        uint prevTimestamp = userAbout[user].timestamp;   // time of the last update
        uint timeSpace = block.timestamp - prevTimestamp; // amount of seconds from the last update
        uint tokenLPAmount = userAbout[user].amount; 

        if((block.number - userAbout[user].startBlock) > 0){
            userAbout[user].weight += (block.number - userAbout[user].startBlock); // weight increases in direct ratio with the user's block number
        }

        if(timeSpace >= SEC){
            // new amount of rewarded tokens
            userAbout[user].reward += (tokenLPAmount * (timeSpace/HOUR) * userAbout[user].weight/ ACCURACY);
            userAbout[user].timestamp = block.timestamp;  // new timestamp
            userAbout[user].startBlock = block.number;  // new block number
        }

    }
}