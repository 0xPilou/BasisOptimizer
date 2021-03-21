/**
 *  Mock Contracts
 */
const LP = artifacts.require("LP");
const Share = artifacts.require("Share");
const Dollar = artifacts.require("Dollar");
const ShareRewardPoolMock = artifacts.require("ShareRewardPoolMock");
const BoardroomMock = artifacts.require("BoardroomMock");

/**
 *  Contract Under Tests
 */
const Optimizer = artifacts.require("Optimizer");


contract("Optimizer Unit Tests", async (deployer, network, [owner])=> {
    it("should deposit LP to the Share Reward Pool ", async ([owner]) => {
        const optimizer = (await Optimizer.deployed());
        const lp = (await LP.deployed());
        const shareRewardPool = (await ShareRewardPoolMock.deployed());
        const amountToDeposit = await lp.balanceOf(owner);
        await optimizer.depositLP(amountToDeposit);

        assert.equal(lp.balanceOf(owner), 0);   
        assert.equal(lp.balanceOf(shareRewardPool), amountToDeposit);   


    });
    it("should get the number of protocols supported", async () => {
        let optimizerFactory = (await OptimizerFactory.deployed());
        const lp = (await LP.deployed());
        const share = (await Share.deployed());
        const dollar = (await Dollar.deployed());
        const boardroom = (await BoardroomMock.deployed());
        const shareRewardPool = (await ShareRewardPoolMock.deployed());
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        const result = await optimizerFactory.getProtocolCount();
        assert.equal(result.toNumber(), 2);
    });



});
