const { expect }  = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe ("Exchange", async () =>{
    let owner;
    let exchange;
    let token; 
    let token2;
    let user1;
    let factory;
    let zeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
        [owner, user1] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Lalala", "LLL", 1000000);
        expect(await token.deployed());

        token2 = await Token.deploy("Lalala", "LLL", 1000000);
        expect(await token2.deployed());

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(token.address);
        expect(await exchange.deployed());

        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();
        expect(await factory.deployed());
    })
    
    describe("exchange constructor", async() => {
        it("it doesn't allows empty token address", async () =>{
            expect(await exchange.name()).to.eq("Elpishki");
            expect(await exchange.totalSupply()).to.eq(0);
            expect(await exchange.symbol()).to.eq("LP");
            expect(await token.name()).to.eq("Lalala");
            expect(await token.totalSupply()).to.eq(1000000);
            expect(await token.symbol()).to.eq("LLL");
        })
    })

    it("Returns an error if token.address which was sent to the contract is zeroAddress", async () =>{
        const Exchange = await ethers.getContractFactory("Exchange");
        await expect( 
            Exchange.deploy(zeroAddress)
        ).to.be.revertedWith("Incorrect token address");

    })

    // AMOUNTS
    describe("getAmount", async () => {
        it("Returns an error if inputReserve or outputReserve equals to 0", async () =>{
            await expect(
                exchange.getAmount(100000, 0, 10000)
            ).to.be.revertedWith("Reserves can't be empty");

            await expect(
                exchange.getAmount(100000, 10000, 0)
            ).to.be.revertedWith("Reserves can't be empty");

            await expect(
                exchange.getAmount(100000, 0, 0)
            ).to.be.revertedWith("Reserves can't be empty");
        })

        it("Gets the correct amount", async () =>{
            expect(await exchange.getAmount(10, 100, 200)).to.eq(18);
            expect(await exchange.getAmount(13, 80, 22)).to.eq(3);
            expect(await exchange.getAmount(44, 500, 75)).to.eq(6);
            expect(await exchange.getAmount(0, 2, 5)).to.eq(0);
        })

    })

    describe("getReserveAmount", async () =>{
        it("Correctly computes getReserveAmount", async () =>{
            await token.approve(exchange.address, 100000);
            await exchange.addLiquidity(100000, {value: 500});
    
            expect(await exchange.getReserveAmount()).to.eq(100000);
            expect(await exchange.balanceOf(owner.address)).to.eq(500);
            expect(await exchange.balanceOf(user1.address)).to.eq(0);
        })
    })

    describe("getTokenAmount", async () =>{
        it("Correctly computes getTokenAmount, otherwise it calls an error", async () =>{
            await token.approve(exchange.address, 100000);
            await exchange.addLiquidity(81204, {value: 3333});
    
            await expect(
                exchange.getTokenAmount(0)
            ).to.be.revertedWith("Too small amount of the sold eth");

            expect(await exchange.getTokenAmount(50)).to.eq(1196);
        })
    })

    describe("getEthAmount", async () =>{
        it("Correctly computes getEthAmount, otherwise it calls an error", async () =>{
            await token.approve(exchange.address, 100000);
            await exchange.addLiquidity(3333, {value: 81204});
    
            await expect(
                exchange.getEthAmount(0)
            ).to.be.revertedWith("Too small amount of the sold tokens");

            expect(await exchange.getEthAmount(50)).to.eq(1196);
        })
    })

    // LIQUIDITY
    describe("addLiquidity", async () =>{
        it("allows zero token amount liquidity", async () =>{
            await token.approve(exchange.address, 100000);
            await exchange.addLiquidity(0);

            expect(await exchange.getReserveAmount()).to.eq(0);
        })

        it("adds new coins for liquidity (with zero reserve)", async () => {
            await token.approve(exchange.address, 100000);
            await exchange.addLiquidity(100000);
            
            expect(await exchange.getReserveAmount()).to.eq(100000);
        })

        it("adds new coins for liquidity (with no empty reserve)", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});
            await exchange.addLiquidity(50000, {value: 50000});

            expect(await exchange.getReserveAmount()).to.eq(150000);
        })

        it("doesn't adds new coins for liquidity (with no empty reserve) if the amount of eth is zero", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});
            await exchange.addLiquidity(50000, {value: 0});

            expect(await exchange.getReserveAmount()).to.eq(100000);
        })

        it("adds the mount of tokens corresponding to the transferred amount of ethers.", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});
            await exchange.addLiquidity(50000, {value: 50});

            expect(await exchange.getReserveAmount()).to.eq(100050);
        })

            it("Reverts an error if amount of tokens wouldn't enough", async () => {
                await token.approve(exchange.address, 200000);
                await exchange.addLiquidity(100000, {value: 100000});

                await expect( 
                    exchange.addLiquidity(40, {value: 50})
                ).to.be.revertedWith("Not sufficient amount of tokens");

            })

        it("reverts if amount of added tokens is not sufficient", async () => {
            await token.approve(exchange.address, 800000);
            await exchange.addLiquidity(100000, {value: 100000});

            expect(
                await exchange.addLiquidity(700000, {value: 700000})
            ).to.be.revertedWith("Not sufficient amount of tokens"); 
        })

        it("mints LP tokens", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});

            expect(await exchange.balanceOf(owner.address)).to.eq(100000);
            expect(await exchange.totalSupply()).to.eq(100000);

            await exchange.addLiquidity(50000, {value: 50});

            expect(await exchange.balanceOf(owner.address)).to.eq(100050);
            expect(await exchange.totalSupply()).to.eq(100050);

        })  

        it("Emits an event which means that transaction has been successfully spent", async () =>{
            await token.approve(exchange.address, 200000);
            await expect(
                exchange.addLiquidity(100000, {value: 100000})
            ).to.emit(token, "Transfer")
             .withArgs(owner.address, exchange.address, 100000);
        })
    })
    
    describe("removeLiquidity", async () => {
        it("Reverts an error if removed amount equals 0", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});

            await expect(
                exchange.removeLiquidity(0,{value: 0})
                ).to.be.revertedWith("Incorrect LP token amount value");
        })

        it("Correctly removes liquidity", async ()=> {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});
            await exchange.removeLiquidity(10000);

            expect(await exchange.totalSupply()).to.eq(90000)
            expect(await exchange.balanceOf(owner.address)).to.eq(90000);

            await token.transfer(user1.address, 200000);
            await token.connect(user1).approve(exchange.address, 150000);
            await exchange.connect(user1).addLiquidity(110000, {value: 110000});
            await exchange.connect(user1).removeLiquidity(10000);

            expect(await exchange.totalSupply()).to.eq(190000)
            expect(await exchange.balanceOf(owner.address)).to.eq(90000);
            expect(await exchange.balanceOf(user1.address)).to.eq(100000);

        })

        it("Removes all liquidity", async ()=>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 100000});
            await exchange.removeLiquidity(100000);

            expect(await exchange.totalSupply()).to.eq(0)
            expect(await exchange.balanceOf(owner.address)).to.eq(0);
        })

        it("burns LP tokens of the message sender", async () => {
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect (await exchange.balanceOf(owner.address)).to.eq(50000);

            await exchange.removeLiquidity(20000);

            expect(await exchange.balanceOf(owner.address)).to.eq(30000);
        })

    })

    // SWAPS
    describe("fromEthToTokensSwap", async () =>{
        it("Reverts an error if _minEth are more then bougthEth", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            await expect(
                exchange.fromEthToTokensSwap(50000000)
            ).to.be.revertedWith("Too small amount of tokens you want to buy");
        })

        it("Adds the correct receiver address and amount to the emited event", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromEthToTokensSwap(20, {value: 100})
            ).to.emit(token, "Transfer")
             .withArgs(token.address, owner.address, 1955);
        })
    })

    describe("fromEthToTokensTrandfer", async () =>{

        it("Adds the correct sender address and amount to the emited event", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromEthToTokensTrandfer(20, user1.address, {value: 100})
                ).to.emit(token, "Transfer")
                 .withArgs(token.address, user1.address, 1955);
        })

        it("Changes the balances of user and contract exchange", async ()=>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromEthToTokensTrandfer(
                    20, 
                    user1.address, 
                    {value: 100}
                )
            ).to.changeTokenBalances(
                token, 
                [exchange, user1], 
                [-1955, 1955]
            );
        })

        it("Doesn't allow other users to burn tokens using address(0) as receiver", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromEthToTokensTrandfer(
                    20, 
                    user1.address, {value: 100}
                )
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        })
    })

    describe("fromTokensToEth", async () => {
        it("Returns error, if minimum amount of eth is less then we can buy using our tokens", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            await expect(
                exchange.fromTokensToEth(500, 250)
            ).to.be.revertedWith("Not enought amount of tokens");
        })

        it("Checks if balances of tokens are correctly changed after realising fromTokensToEth function", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromTokensToEth(500, 230)
            ).to.changeTokenBalances(
                token, 
                [owner, exchange], 
                [-500, 500]
            );
        })

        it("Checks if balances of ethers are correctly changed after realising fromTokensToEth function", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromTokensToEth(500, 230)
            ).to.changeEtherBalance(
                token, 
                [exchange, owner], 
                [-248, 248]
            );
        })

        it("Checks if are emited 2 different transfer events: tokens to the exchange contract and ethers to the message sender contract", async () =>{
            await token.approve(exchange.address, 200000);
            await exchange.addLiquidity(100000, {value: 50000});

            expect(
                await exchange.fromTokensToEth(500, 230)
            ).to.emit(token, "Transfer")
                .withArgs(owner.address, exchange.address, 500);

            expect(
                await exchange.fromTokensToEth(500, 230)
            ).to.emit(token, "Transfer")
             .withArgs(
                exchange.address, 
                owner.address, 
                248
            );
        })
    })

    describe("tokenToTokenSwap", async () =>{

        const createExchange = async (factory, tokenAddress, sender) => {
            const exchangeAddress = await factory
              .connect(sender).callStatic.createExchange(tokenAddress);
          
            await factory.connect(sender).createExchange(tokenAddress);
          
            const Exchange = await ethers.getContractFactory("Exchange");
          
            return await Exchange.attach(exchangeAddress);
          };

        it("Returns an error if mapping tokenExchanges with the set token address doesn't exists", async ()=>{
            await factory.createExchange(token.address);

            await expect(
                factory.getExchangeAddr(token2.address)
            ).to.be.revertedWith("This exchange doesn't exist");
        })

        it("Correctly swaps token to token", async () =>{
            const Token = await ethers.getContractFactory("Token");
            const Factory = await ethers.getContractFactory("Factory");

            const firstToken = await Token.deploy("First", "FST", 2000000);
            const secondToken = await Token.connect(user1).deploy("Second", "SND", 1000000);
            const factory = await Factory.deploy();
            
            expect(await firstToken.deployed());
            expect(await secondToken.deployed());
            expect(await factory.deployed());

            const firstExchange = await createExchange(factory, firstToken.address, owner);
            const secondExchange = await createExchange(factory, secondToken.address, user1);

            await firstToken.approve(firstExchange.address, 200000);
            await firstExchange.addLiquidity(100000, {value: 50000});

            expect(await firstExchange.getReserveAmount()).to.eq(100000);
            expect(await firstToken.balanceOf(user1.address)).to.eq(0);

            await secondToken.connect(user1).approve(secondExchange.address, 300000);
            await secondExchange.connect(user1).addLiquidity(200000, {value: 50000});

            expect(await secondExchange.getReserveAmount()).to.eq(200000);
            expect(await secondToken.balanceOf(owner.address)).to.eq(0);

            
            await secondExchange.connect(user1).tokenToTokenSwap(50000, 2000, firstToken.address);
            
            expect(await secondExchange.getReserveAmount()).to.eq(250000);
            expect(await firstExchange.getReserveAmount()).to.eq(83410);
            expect(await firstToken.balanceOf(user1.address)).to.eq(16590);
            
            
            await firstExchange.tokenToTokenSwap(30000, 35000, secondToken.address);

            expect(await firstExchange.getReserveAmount()).to.eq(113410);
            expect(await secondToken.balanceOf(owner.address)).to.eq(70697);
            expect(await secondExchange.getReserveAmount()).to.eq(179303);

        })
    })

});