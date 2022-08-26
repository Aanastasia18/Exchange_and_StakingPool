const { expect }  = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("Factory", async ()=>{
    let factory;
    let exchange;
    let user;
    let token;
    let token2;

    beforeEach(async () =>{
        [owner, user] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Lalala", "LLL", 1000000);
        expect(await token.deployed());

        token2 = await Token.deploy("Lalala", "LLL", 1000000);
        expect(await token2.deployed());

        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();
        expect(await factory.deployed());

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(token.address);
        expect(await exchange.deployed());
    })

    describe("createExchange", async () =>{
        it("Returns an error if token address is empty", async ()=>{
            let emptyAddress = "0x0000000000000000000000000000000000000000";
            
            await expect(
                factory.createExchange(emptyAddress)
            ).to.be.revertedWith("Invalid token address");
        })

        it("Reverts an error if exchange already exists", async() =>{
            await factory.createExchange(token.address);

            await expect( 
                factory.createExchange(token.address)
            ).to.be.revertedWith("This exchange alresdy exists");


        })

        it("creates exchanges", async () =>{
            const firstExchangeAddress = await factory.callStatic.createExchange(token.address);

            await factory.createExchange(token.address);
            expect(
                await factory.getExchangeAddr(token.address)
            ).to.eq(firstExchangeAddress);
            
            const secondExchangeAddress = await factory.callStatic.createExchange(token2.address);
            await factory.createExchange(token2.address);

            expect(
                await factory.getExchangeAddr(token2.address)
            ).to.eq(secondExchangeAddress);
        })

        it("reverts an error from getExchange is exchange doesn't exists", async () => {
            await expect(
                factory.getExchangeAddr(token2.address)
            ).to.be.revertedWith("This exchange doesn't exist");
        })
    })
})