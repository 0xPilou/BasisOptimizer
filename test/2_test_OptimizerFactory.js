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
 const OptimizerFactory = artifacts.require("OptimizerFactory");


contract("Optimizer Factory Unit Tests", async (deployer, network, accounts)=> {
    it("should add a new protocol to the Optimizer Factory ", async () => {
        let optimizerFactory = (await OptimizerFactory.deployed());
        const lp = (await LP.deployed());
        const share = (await Share.deployed());
        const dollar = (await Dollar.deployed());
        const boardroom = (await BoardroomMock.deployed());
        const shareRewardPool = (await ShareRewardPoolMock.deployed());
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        const result = await optimizerFactory.protocols(0);
        assert.equal(result.protocolId, 0);   
        assert.equal(result.LP, lp.address);
        assert.equal(result.share, share.address);
        assert.equal(result.dollar, dollar.address);
        assert.equal(result.shareRewardPool, shareRewardPool.address);
        assert.equal(result.boardroom, boardroom.address);
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
    it("should create a new optimizer with Protocol ID 2", async () => {
        let optimizerFactory = (await OptimizerFactory.deployed());
        const lp = (await LP.deployed());
        const share = (await Share.deployed());
        const dollar = (await Dollar.deployed());
        const boardroom = (await BoardroomMock.deployed());
        const shareRewardPool = (await ShareRewardPoolMock.deployed());
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        await optimizerFactory.createOptimizer(2)
        const result = await optimizerFactory.optimizers(0);
        assert.equal(optimizerFactory.optimizers(0), optimizerFactory.optimizers(0));   
    });
    it("should get the number of optimizers created ", async () => {
        let optimizerFactory = (await OptimizerFactory.deployed());
        const lp = (await LP.deployed());
        const share = (await Share.deployed());
        const dollar = (await Dollar.deployed());
        const boardroom = (await BoardroomMock.deployed());
        const shareRewardPool = (await ShareRewardPoolMock.deployed());
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        await optimizerFactory.createOptimizer(1)
        const result = await optimizerFactory.getOptimizerCount(0);
        assert.equal(result.toNumber(), 2);
    });






});
   