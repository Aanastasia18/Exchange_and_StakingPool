const { expect }  = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;
const utils = require("ethers").utils;


describe ("StakingPool", async () =>{
    let owner;
    let user; 
    let stakingPool;
    let lpToken;
    let rewardToken;

    const ONE_DAY = 3600*24
    let timestamp = Date.now() / 1000; // time in secconds
    timestamp = parseInt(timestamp);

    beforeEach(async () =>{
        const TokenLP = await ethers.getContractFactory("Token");
        const TokenReward = await ethers.getContractFactory("Token");
        const StakingPool = await ethers.getContractFactory("StakingPool");
        
        [owner, user] = await ethers.getSigners();

        lpToken = await TokenLP.deploy("Elpishki", "LP");
        expect(await lpToken.deployed());
        rewardToken = await TokenReward.deploy("Reward", "RWD");
        expect(await rewardToken.deployed());

        stakingPool = await StakingPool.deploy(lpToken.address, rewardToken.address);
        expect(await stakingPool.deployed());
    })

    describe('constructor', async () => { 
        it("Should return correct data about RWD and LP tokens", async () => {
            expect(await lpToken.name()).to.eq("Elpishki");
            expect(await lpToken.symbol()).to.eq("LP");
            expect(await lpToken.totalSupply()).to.eq(utils.parseEther("500.0"));

            expect(await rewardToken.name()).to.eq("Reward");
            expect(await rewardToken.symbol()).to.eq("RWD");
            expect(await rewardToken.totalSupply()).to.eq(utils.parseEther("500.0"));
        })
    })
    
    
    describe("firstDeposit", async () =>{
        it("reverts a mistake when the user is not owner ", async () =>{
            await expect(stakingPool.connect(user).firstDeposit(utils.parseEther("1.0")))
            .to.be.revertedWith("Not the owner!");
        })

        it("reverts a mistake when the user has already deposited his funds ", async () =>{
            await rewardToken.approve(stakingPool.address, utils.parseEther("500.0"));
            await stakingPool.firstDeposit(utils.parseEther("250.0"));

            await expect(stakingPool.firstDeposit(utils.parseEther("250.0")))
            .to.be.revertedWith("User has already deposited funds");

        })
        
        it("checks if the firstDeposit function emits UpdatedTokenDeposit event", async ()=>{
            // await stakingPool.lock.call();
            await rewardToken.approve(stakingPool.address, 10000);
            expect(
                await stakingPool.firstDeposit(1000)
                ).to.emit(stakingPool, "UpdatedTokenDeposit")
                .withArgs(
                    owner.address, 
                    1000
                    );
                })
                
                it("Makes correct changes in owner's userAbout structure", async () =>{
                    
                    // expect(await stakingPool.getStartBlock()).to.eq(0);
                    // expect(await stakingPool.getWeight()).to.eq(0);
                    await stakingPool.lock.call();
                    
                    await rewardToken.approve(stakingPool.address, 10000);
                await stakingPool.firstDeposit(1000);
                
                expect(await stakingPool.getStartBlock()).to.eq(1);
                expect(await stakingPool.getWeight()).to.eq(1);
            })
        })
        
        describe("Main part", async () =>{

            beforeEach(async () =>{
                await rewardToken.approve(stakingPool.address, utils.parseEther("500.0"));
                await stakingPool.firstDeposit(utils.parseEther("500.0"));
            })

            describe("rewardingTokenSupply", async() =>{
                it("Should show the amount of reward tokens that are in contract ", async () =>{

                    expect(await stakingPool.rewardingTokenSupply()).to.eq(utils.parseEther("500.0"));

                })
            })

            describe("partialLPDeposit", async ()=>{
                it("Reverts with an error if amount of RWD tokens are less then 1", async() =>{
                    await lpToken.approve(stakingPool.address, 1000000);
                    await expect(
                        stakingPool.partialLPDeposit(2)
                    ).to.be.revertedWith("Deposite amount minimum 1 LP!");
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

                it("", async ()=>{
                    await lpToken.approve(stakingPool.address, utils.parseEther("3.0"));
                    
                    await lpToken.transfer(user.address, utils.parseEther("1.0"));
                    
                    await lpToken.connect(user).approve(stakingPool.address, utils.parseEther("1.0"));

                    expect(await stakingPool.connect(user).getWeight()).to.eq(0);


                    expect( 
                        await stakingPool.connect(user).partialLPDeposit(utils.parseEther("1.0"))
                    ).to.emit(stakingPool, "UpdatedTokenDeposit")
                        .withArgs(
                            user.address, 
                            utils.parseEther("1.0")
                        );
                            
                    // await stakingPool.connect(user).partialLPDeposit(utils.parseEther("1.0"));
                    expect(await stakingPool.connect(user).getWeight()).to.eq(1);
                            

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

                    await expect(stakingPool.partialWithdrawOfLPTokens(utils.parseEther("10000.0")))
                    .to.be.revertedWith("Don't have enough LPs in pool");
                })

                it("Changes user amount in the userAbout structure (decreases)", async () =>{
                    let amount = await lpToken.balanceOf(owner.address);
                    await lpToken.approve(stakingPool.address, amount);
                    await stakingPool.depositeAllLPTokens();
                    // before
                    expect(await stakingPool.getUserAmount()).to.eq(utils.parseEther("500.0"));

                    await stakingPool.partialWithdrawOfLPTokens(utils.parseEther("3.0"));
                    // after
                    expect(await stakingPool.getUserAmount()).to.eq(utils.parseEther("497"));
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
                    .to.be.revertedWith("Don't have enough LPs in pool");
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

                    expect( await stakingPool.getWeight()).to.eq(370);
                    // expect( await stakingPool.getStartBlock()).to.eq(308);
                    expect( await stakingPool.getUserReward()).to.eq(42550000000);
                })
            })

            describe("partialWithdrawOfRewardTokens", async () =>{
                it("Returns an error if user doesn't have reward tokens", async() => {
                    await expect(
                        stakingPool.connect(user).partialWithdrawOfRewardTokens(5)
                    ).to.be.revertedWith("Don't have enough RWDs in pool");
                })

                it("transfers a part from reward tokens to the owner", async() =>{

                    await lpToken.approve(stakingPool.address, utils.parseEther("10.0"));
                    await stakingPool.partialLPDeposit(utils.parseEther("10.0"));
                    expect( await stakingPool.getUserReward()).to.eq(0);

                    // evm_mine - method that generates a new block that will include as many pending transactions as possible.
                    await ethers.provider.send('evm_mine', [timestamp += ONE_DAY]);

                    
                    await stakingPool.updatingReward(owner.address); 

                    let stakingpoolRewardBefore = await stakingPool.getUserReward();

                    await stakingPool.partialWithdrawOfRewardTokens(100);

                    let stakingpoolRewardAfter = await stakingPool.getUserReward();
                    expect( await stakingpoolRewardAfter.add(100)).to.eq(stakingpoolRewardBefore);
                    expect( await rewardToken.balanceOf(owner.address)).to.eq(100);
                })
            })

            describe("withdrawAllRewardTokens", async () =>{

                it("transfers all reward tokens to the owner", async() =>{

                    await lpToken.approve(stakingPool.address, utils.parseEther("10.0"));
                    await stakingPool.partialLPDeposit(utils.parseEther("10.0"));
                    expect( await stakingPool.getUserReward()).to.eq(0);

                    // evm_mine - method that generates a new block that will include as many pending transactions as possible.
                    await ethers.provider.send('evm_mine', [timestamp += ONE_DAY]);

                    
                    await stakingPool.updatingReward(owner.address);

                    let stakingpoolRewardBefore = await stakingPool.getUserReward();
                    let ownerRewardBefore = await rewardToken.balanceOf(owner.address);

                    await stakingPool.withdrawAllRewardTokens();

                    let stakingpoolRewardAfter = await stakingPool.getUserReward();
                    let ownerRewardAfter = await rewardToken.balanceOf(owner.address);

                    expect( await stakingpoolRewardAfter.add(ownerRewardBefore)).to.eq(0);

                    expect( await ownerRewardAfter).to.eq(stakingpoolRewardBefore);
                })
            })

            describe("withdrawAllTokens", async () =>{
                it("transfers all reward and LP tokens to the owner", async() =>{
                    let amount = await lpToken.balanceOf(owner.address);
                    await lpToken.approve(stakingPool.address, amount);
                    await stakingPool.depositeAllLPTokens();

                    //before 
                    expect(await lpToken.balanceOf(owner.address)).to.eq(0);

                    
                    //after 
                    // evm_mine - method that generates a new block that will include as many pending transactions as possible.
                    await ethers.provider.send('evm_mine', [timestamp += ONE_DAY]);
                    
                    
                    await stakingPool.updatingReward(owner.address);
                    
                    let stakingpoolRewardBefore = await stakingPool.getUserReward();
                    let ownerRewardBefore = await rewardToken.balanceOf(owner.address);
                    
                    await stakingPool.withdrawAllTokens();

                    let stakingpoolRewardAfter = await stakingPool.getUserReward();
                    let ownerRewardAfter = await rewardToken.balanceOf(owner.address);

                    expect(await lpToken.balanceOf(owner.address)).to.eq(amount);
                    
                    expect( await stakingpoolRewardAfter.add(ownerRewardBefore)).to.eq(0);

                    expect( await ownerRewardAfter).to.eq(stakingpoolRewardBefore);
                })
            })



        })
    })


