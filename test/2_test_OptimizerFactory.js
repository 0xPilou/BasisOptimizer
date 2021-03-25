/**
*  Dependencies
*/
const Web3 = require("web3");
const truffleAssert = require('truffle-assertions');
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

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

contract("OptimizerFactory Unit Tests", () => {
    let accounts = null;
    let optimizer = null;
    let lp = null;
    let share = null;
    let dollar = null;
    let shareRewardPool = null;
    let boardroom = null;
    let optimizerFactory = null;
    
    before(async () => {
        accounts = web3.eth.getAccounts().then(function(acc){ accounts = acc })
        lp = await LP.deployed();
        share = await Share.deployed();
        dollar = await Dollar.deployed();
        shareRewardPool = await ShareRewardPoolMock.deployed();
        boardroom = await BoardroomMock.deployed();
        optimizerFactory = await OptimizerFactory.deployed();

    });
    it("should add a new protocol to the Optimizer Factory ", async () => {
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
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        const result = (await optimizerFactory.getProtocolCount()).toNumber();
        assert.equal(result, 2);
    });
    it("should get the number of optimizers created (0)", async () => {
        const result = (await optimizerFactory.getOptimizerCount()).toNumber();
        assert.equal(result, 0);
    });
    it("should create a new optimizer with Protocol ID 2", async () => {
        await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
        await optimizerFactory.createOptimizer(2);
        const newOptimizerId = (await optimizerFactory.getOptimizerCount()).toNumber(); 
        const newOptimizerAddr = await optimizerFactory.optimizers(newOptimizerId - 1);
        console.log(newOptimizerAddr);
        optimizer = await Optimizer.at(newOptimizerAddr);

        await lp.approve(optimizer.address, 100);
        await optimizer.depositLP(100);
        const result = await optimizer.LpStaked;     
        console.log(result);
    });
  //  it("should get the number of optimizers created ", async () => {
  //      await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
  //      await optimizerFactory.createOptimizer(1)
  //      const result = await optimizerFactory.getOptimizerCount(0);
  //      assert.equal(result.toNumber(), 2);
  //  });
});
   