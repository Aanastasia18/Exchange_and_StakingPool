// const { expect }  = require("chai");
// const hre = require("hardhat");
// const ethers = hre.ethers;


// describe("Token", () =>{
//     let token;
//     let owner;
//     let recipient;
//     let acc_2;
//     let acc_3;
//     let acc_4;

//     beforeEach(async () =>{
//         [owner, recipient, acc_2, acc_3, acc_4] = await ethers.getSigners();
//         const Token = await ethers.getContractFactory("Token");

//         token = await Token.connect(owner).deploy(2000000);
//         expect(await token.deployed());
//     })

//     /////// name() //////
//     it('Shows the correct name', async () => {
//         expect(await token.name()).to.eq('Intern');
//     })

//     it('Shows incorrect name', async () => {
//         expect(await token.name()).to.not.eq('Interns');
//     })

//     /////// symbol() //////
//     it('Shows the correct symbol', async () => {
//         expect(await token.symbol()).to.eq('INT');
//     })

//     it('Shows incorrect symbol', async () => {
//         expect(await token.symbol()).to.not.eq('INTs');
//     })

//     /////// decimals() //////
//     it('Shows the correct decimals', async () => {
//         expect(await token.decimals()).to.eq(18);
//     })

//     it('Shows incorrect decimals', async () => {
//         expect(await token.decimals()).to.not.eq(19);
//     })

//     /////// totalSupply() //////
//     it('Shows the correct totalTokenSupply', async () => {
//         expect(await token.totalTokenSupply()).to.eq('2000000');
//     })

//     it('Shows incorrect totalTokenSupply', async () => {
//         expect(await token.totalTokenSupply()).to.not.eq('2000001');
//     })

//     /////// transfer(address to, uint256 amount) //////
//     it('Sends amount of money to the recipient', async () => {
//         await token.transfer(recipient.address, 1000);
//         expect(await token.balanceOf(recipient.address)).to.eq(1000);
//     })

//     /////// allowance(address owner, address spender) //////
//     it('Adds to the allowances owner and spender', async () => {
//         expect(await token.allowance(owner.address, recipient.address)).to.eq(0);
//         expect(await token.allowance(owner.address, recipient.address)).to.not.eq(-1);
//     })

//     /////// approve(address spender, uint256 amount) //////
//     it("checks the approve function", async () => {
//         await token.approve(recipient.address, 300);
//         expect(await token.allowance(owner.address, recipient.address)).to.eq(300);
//         expect(await token.approve(recipient.address, 300)).to.emit(token, "Approval").withArgs(3);
//     })

//     it("checks if the function transfer cannot send more money then exist on the balance", async () => {
//         await expect(token.transfer(recipient.address, 8000000)).to.be.revertedWith('Not enough balance (ERC20)');
//     })

//     it("Checks if the balances of the sender and the recipient are charnger after transaction (TransferFrom)", async () => {
//         await token.connect(owner).approve(owner.address, token.balanceOf(owner.address));

//         await expect(await token.connect(owner).transferFrom(owner.address, recipient.address, 1)).to.changeTokenBalances(
//             token,
//             [owner.address, recipient.address],
//             [-1, 1]
//           );
//         expect(await token.transferFrom(owner.address, recipient.address, 1)).to.emit(token, "Transaction").withArgs(3);
//     })

//     ////// _mint(address _tokenShopAddress, uint _tokensToMint) //////////
//     it("Checks if the function _mint can minting tokens", async () => {
//         await token.connect(owner)._mint(recipient.address, 2000000);
//         expect(await token.totalTokenSupply()).to.eq(4000000);
//     })

//     /////// _burn(address _tokenShopAddress, uint _tokensToBurn) ///////////
//     it("Checks if the function _burn can burning tokens", async () => {
//         await token.connect(owner)._burn(owner.address,1000000);
//         expect(await token.totalTokenSupply()).to.eq(1000000);
//     })

//     ///////////// onlyOwner() /////////////////////////
//     it("Checks if the modifier \"only owner\" correctly calls the error", async () => {    
//         await expect(token.connect(recipient).approve(owner.address, 300)).to.be.revertedWith('Invalid owner (ERC20)');
//     })

//     ///////////// enoughBalance() /////////////////////////
//     it("Checks if the modifier \"enoughBalance\" correctly calls the error", async () => {
//         await expect(token.transfer(recipient.address, 10000000)).to.be.revertedWith('Not enough balance (ERC20)');
//         await expect(token.transferFrom(owner.address, recipient.address, 10000000000)).to.be.revertedWith('Not enough balance (ERC20)');
//     })


//     /////////// Testing the whitelist modifier /////////////////////////
//     it("The modifier should let the acc_2 to mint the tokens", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await token.connect(acc_2)._mint(acc_2.address, 1000000);
//         expect(await token.totalTokenSupply()).to.eq(3000000);
//         expect(await token.balanceOf(acc_2.address)).to.eq(1000000);
//     })

//     it("The modifier should let the acc_2 to burn the tokens", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await token.connect(acc_2)._mint(acc_2.address, 1000000);
//         await token.connect(acc_2)._burn(acc_2.address, 1000000);
//         expect(await token.totalTokenSupply()).to.eq(2000000);
//         expect(await token.balanceOf(acc_2.address)).to.eq(0);
//     })

//     it("The modifier shouldn't let the acc_4 to mint the tokens", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await expect(token.connect(acc_4)._mint(acc_4.address, 1000000)).to.be.revertedWith("You need to be whitelisted");
//     })

//     it("The modifier shouldn't let the acc_4 to burn the tokens", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await token.connect(acc_2)._mint(acc_4.address, 1000000);
//         await expect(token.connect(acc_4)._burn(acc_4.address, 1000000)).to.be.revertedWith("You need to be whitelisted");
//     })

//     it("The function \"addAddressesToWhitelist\" should let people from the whitelist to add there new addresses", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await token.connect(acc_2).addAddressesToWhitelist(acc_4.address);
//         expect(await token.verifyAddressesFromWhitelist(acc_4.address)).to.be.true;
//     })

//     it("The function \"deleteAddressesFromWhitelist\" should let people from the whitelist to delete addresses", async () => {
//         await token.connect(owner).addAddressesToWhitelist(acc_2.address);
//         await token.connect(acc_2).addAddressesToWhitelist(acc_4.address);
//         await token.connect(acc_2).deleteAddressesFromWhitelist(acc_4.address);
//         expect(await token.connect(recipient).verifyAddressesFromWhitelist(acc_4.address)).to.be.false;
//     })





    
    


// })