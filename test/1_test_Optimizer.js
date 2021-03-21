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
    it("should withdraw LP from the Share Reward Pool", async () => {

    });

    it("should deposit Share to the Boardroom", async () => {

    });

    it("should withdraw Share from the Boardroom", async () => {

    });

    it("should ...", async () => {

    });

});
