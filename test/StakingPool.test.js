const { expect }  = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;
const utils = require("ethers").utils;
const BigNumber = utils.BigNumber;
// const from = BigNumber.from;


describe ("StakingPool", async () =>{
    let owner;
    let user; 
    let stakingPool;
    let lpToken;
    let rewardToken;

    const ONE_DAY = 3600*24
    let timestamp = Date.now() / 1000; // time in secconds
    timestamp = parseInt(timestamp)

    beforeEach(async () =>{
        [owner, user] = await ethers.getSigners();

        const TokenLP = await ethers.getContractFactory("Token");
        const TokenReward = await ethers.getContractFactory("Token");
        lpToken = await TokenLP.deploy("Elpishki", "LP", utils.parseEther("8.0"));
        expect(lpToken.deployed());
        rewardToken = await TokenReward.deploy("Reward", "RWD", utils.parseEther("600000000000000.0"))
        expect(rewardToken.deployed());

        const StakingPool = await ethers.getContractFactory("StakingPool");
        stakingPool = await StakingPool.deploy(lpToken.address, rewardToken.address);
        expect(stakingPool.deployed());
    })

    describe('constructor', async () => { 
        it("Should return correct data about RWD and LP tokens", async () => {
            expect(await lpToken.name()).to.eq("Elpishki");
            expect(await lpToken.symbol()).to.eq("LP");
            expect(await lpToken.totalSupply()).to.eq(utils.parseEther("8.0"));

            expect(await rewardToken.name()).to.eq("Reward");
            expect(await rewardToken.symbol()).to.eq("RWD");
            expect(await rewardToken.totalSupply()).to.eq(utils.parseEther("600000000000000.0"));
        })
    })

    describe("firstDeposit", async () =>{
        it("reverts a mistake when the user is not owner ", async () =>{
            await expect(stakingPool.connect(user).firstDeposit(utils.parseEther("1.0")))
            .to.be.revertedWith("You're not the owner of these funds");
        })

        it("checks if the firstDeposit function emits UpdatedTokenDeposit event", async ()=>{
            await rewardToken.approve(stakingPool.address, 10000);
            // await stakingPool.lock.call();
            expect(
                await stakingPool.firstDeposit(1000)
            ).to.emit(stakingPool, "UpdatedTokenDeposit")
                 .withArgs(
                    owner.address, 
                    1000
                );
        })

        it("Makes correct changes in owner's userAbout structure", async () =>{
            await rewardToken.approve(stakingPool.address, 10000);
             
            expect(await stakingPool.getStartBlock()).to.eq(0);
            expect(await stakingPool.getWeight()).to.eq(0);

            await stakingPool.firstDeposit(1000);

            expect(await stakingPool.getStartBlock()).to.eq(1);
            expect(await stakingPool.getWeight()).to.eq(1);
        })
    })

    describe("rewardingTokenSupply", async() =>{
        it("Should show the amount of reward tokens that are in contract ", async () =>{
            await rewardToken.approve(stakingPool.address, 10000);
            await stakingPool.firstDeposit(1000);

            expect(await stakingPool.rewardingTokenSupply()).to.eq(1000);

        })
    })

    describe("partialLPDeposit", async ()=>{
        it("Reverts with an error if amount of RWD tokens are less then 1", async() =>{
            await lpToken.approve(stakingPool.address, 1000000);
            await expect(
                stakingPool.partialLPDeposit(2)
            ).to.be.revertedWith("Deposite amount of tokens should be minimum 1 RWD");
        })

        it("changes amount and timestamp (increases)", async() =>{
            // before
            let oldTimestamp = await stakingPool.getTimestamp();
            await lpToken.approve(stakingPool.address, utils.parseEther("3.0"));
            await stakingPool.partialLPDeposit(utils.parseEther("1.0"));

            // after
            expect(await stakingPool.getUserAmount()).to.eq(utils.parseEther("1.0"));
            expect(await stakingPool.getTimestamp()).to.not.eq(oldTimestamp);
        })

        it("Emites a new UpdatedTokenDeposit event", async () =>{
            await lpToken.approve(stakingPool.address, utils.parseEther("3.0"));

            expect( 
                await stakingPool.partialLPDeposit(utils.parseEther("1.0"))
            ).to.emit(stakingPool, "UpdatedTokenDeposit")
                 .withArgs(
                    owner.address, 
                    utils.parseEther("1.0")
            );

        })

    })

    describe("depositeAllLPTokens", async () =>{
        it("Correctly calls the partialLPDeposit and transfers it as amount total supply of the users LP tokens ", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            expect( 
                await stakingPool.depositeAllLPTokens()
            ).to.emit(stakingPool, "UpdatedTokenDeposit")
                 .withArgs(
                    owner.address, 
                    utils.parseEther("8.0")
            );
        })
    })

    describe("partialWithdrawOfLPTokens", async () =>{
        it("Reverts with an error if amount of LP tokens are less then sent amount parameter", async() =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();

            await expect(stakingPool.partialWithdrawOfLPTokens(utils.parseEther("10.0")))
            .to.be.revertedWith("You don't have enough LP tokens in the pool");
        })

        it("Changes user amount in the userAbout structure (decreases)", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();
            // before
            expect(await stakingPool.getUserAmount()).to.eq(utils.parseEther("8.0"));

            await stakingPool.partialWithdrawOfLPTokens(utils.parseEther("3.0"));
            // after
            expect(await stakingPool.getUserAmount()).to.eq(utils.parseEther("5.0"));
        })

        it("Increases personal LP token user pool", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();
            // before
            expect(await lpToken.balanceOf(owner.address)).to.eq(utils.parseEther("0.0"));

            await stakingPool.partialWithdrawOfLPTokens(utils.parseEther("3.0"));
            // after
            expect(await lpToken.balanceOf(owner.address)).to.eq(utils.parseEther("3.0"));
        })

        it("Emits transaction TokenWithdraw", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();
            expect(
                await stakingPool.partialWithdrawOfLPTokens(utils.parseEther("3.0"))
            ).to.emit(stakingPool, "TokenWithdraw")
            .withArgs(
                    owner.address, 
                    utils.parseEther("3.0")
            );

        })
    })

    describe("withdrawAllLPTokens", async () =>{
        it("Reverts with an error if amount of LP tokens equals to 0", async() =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();
            await stakingPool.partialWithdrawOfLPTokens(amount);

            await expect(stakingPool.withdrawAllLPTokens())
            .to.be.revertedWith("You don't have LP tokens in this pool");
        })

        it("Should set amount in user info as 0", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();

            //before 
            expect(await stakingPool.getUserAmount()).to.not.eq(0);

            await stakingPool.withdrawAllLPTokens();

            //after 
            expect(await stakingPool.getUserAmount()).to.eq(0);
        })

        it("should transfer all LP tokens to the msg.sender", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();

            //before 
            expect(await lpToken.balanceOf(owner.address)).to.eq(0);

            await stakingPool.withdrawAllLPTokens();

            //after 
            expect(await lpToken.balanceOf(owner.address)).to.eq(amount);
        })

        it("Emits transaction TokenWithdraw", async () =>{
            let amount = await lpToken.balanceOf(owner.address);
            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();
            expect(
                await stakingPool.withdrawAllLPTokens()
            ).to.emit(stakingPool, "TokenWithdraw")
            .withArgs(
                    owner.address, 
                    amount
            );

        })

        
    })

    describe("updatingReward", async () =>{

        it("Checks if the structure reward, weight, timestamp, startBlock parameters change", async () =>{
            let amount = await lpToken.balanceOf(owner.address);

            await lpToken.approve(stakingPool.address, amount);
            await stakingPool.depositeAllLPTokens();

            // evm_mine - method that generates a new block that will include as many pending transactions as possible.
            await ethers.provider.send('evm_mine', [timestamp += ONE_DAY]);

            expect( await stakingPool.getWeight()).to.eq(1);
            // expect( await stakingPool.getStartBlock()).to.eq(295);
            expect( await stakingPool.getUserReward()).to.eq(0);
            
            await stakingPool.updatingReward(owner.address);
            
            expect( await stakingPool.getWeight()).to.eq(3);
            // expect( await stakingPool.getStartBlock()).to.eq(308);
            expect( await stakingPool.getUserReward()).to.eq(5520000);
        })
    })

    describe("partialWithdrawOfRewardTokens", async () =>{
        it("Returns an error if user doesn't have reward tokens", async() => {
            await expect(
                stakingPool.connect(user).partialWithdrawOfRewardTokens(5)
            ).to.be.revertedWith("You don't have enough reward tokens in the pool");
        })

        // it("transfers a part from reward tokens to the owner", async() =>{
            
        //     let amount = await lpToken.balanceOf(owner.address);
        //     await lpToken.approve(stakingPool.address, amount);
        //     await stakingPool.depositeAllLPTokens();
            
        //     // evm_mine - method that generates a new block that will include as many pending transactions as possible.
        //     await ethers.provider.send('evm_mine', [timestamp += ONE_DAY]);
        //     expect( await stakingPool.getUserReward()).to.eq(0);
            
        //     await stakingPool.updatingReward(owner.address);
        //     expect( await stakingPool.getUserReward()).to.eq(5520000);
        //     expect(await rewardToken.balanceOf(stakingPool.address)).to.eq(5520000);

            // await stakingPool.withdrawAllRewardTokens();

            // expect(await rewardToken.balanceOf(owner.address)).to.eq(5520000)

        // })
    })






})


