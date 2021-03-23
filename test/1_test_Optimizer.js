
const LP = artifacts.require("LP");
const Share = artifacts.require("Share");
const Dollar = artifacts.require("Dollar");
const ShareRewardPoolMock = artifacts.require("ShareRewardPoolMock");
const BoardroomMock = artifacts.require("BoardroomMock");
const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

/**
 *  Contract Under Tests
 */
const Optimizer = artifacts.require("Optimizer");


contract("Optimizer Unit Tests", () => {
    let optimizer = null;
    let lp = null;
    let share = null;
    let shareRewardPool = null;
    let accounts = null;
    before(async () => {
        accounts = web3.eth.getAccounts().then(function(acc){ accounts = acc })
        optimizer = await Optimizer.deployed();
        lp = await LP.deployed();
        share = await Share.deployed();
        shareRewardPool = await ShareRewardPoolMock.deployed();
    });
    it("should deposit 100 LP token to the Share Reward Pool", async () => {
        const amountToDeposit = web3.utils.toWei('100', 'ether');
        await lp.approve(optimizer.address, amountToDeposit);
        await optimizer.depositLP(amountToDeposit);
        const poolBal = await lp.balanceOf(shareRewardPool.address);      
        assert.equal(poolBal, amountToDeposit);   
    });
  //  it("should not be able to withdraw more LP than the amount deposited", async () => {
  //      const amountToWithdraw = 100;
  //      await optimizer.withdrawLP(amountToWithdraw);
  //      
  //  });
    it("should withdraw 100 LP token from the Share Reward Pool", async () => {
        const amountToWithdraw = web3.utils.toWei('100', 'ether');

        const userLpBal_before = web3.utils.fromWei(await lp.balanceOf(accounts[0]));
        const optimizerShareBal_before = web3.utils.fromWei(await share.balanceOf(optimizer.address));
        const poolShareBal_before = web3.utils.fromWei(await share.balanceOf(shareRewardPool.address));

        await optimizer.withdrawLP(amountToWithdraw);

        const userLpBal_after = web3.utils.fromWei(await lp.balanceOf(accounts[0]));
        const optimizerShareBal_after = web3.utils.fromWei(await share.balanceOf(optimizer.address));
        const poolShareBal_after = web3.utils.fromWei(await share.balanceOf(shareRewardPool.address));

        assert.equal(userLpBal_after - userLpBal_before, 100);
        assert.equal(optimizerShareBal_after - optimizerShareBal_before, poolShareBal_before - poolShareBal_after);
    });
    it("should deposit Share to the Boardroom", async () => {
        const amountToDeposit = await share.balanceOf(accounts[0]);  
        const optimizerShareBal = await share.balanceOf(optimizer.address);      

        await share.approve(optimizer.address, amountToDeposit);
        await optimizer.depositShare(amountToDeposit);
        
        const expectedBoardroomBal = optimizerShareBal.add(amountToDeposit); 
        const boardRoomBal = web3.utils.fromWei(await share.balanceOf(BoardroomMock.address));      
        assert.equal(boardRoomBal, web3.utils.fromWei(expectedBoardroomBal.toString()));           
    });

  // it("should withdraw Share from the Boardroom", async () => {

  // });

  // it("should ...", async () => {

  // });

});



//console.log(
//    `====================================
//    User Balances Before :
//        > LP : ${userLpBal_before}
//    User Balances After :
//        > LP : ${userLpBal_after}
//    =======================================
//    Share Reward Pool Balances Before :
//        > Share : ${poolShareBal_before}
//    Share Reward Pool Balances After :
//        > Share : ${poolShareBal_after}
//    =======================================
//    Optimizer Balances Before :
//        > Share : ${optimizerShareBal_before}
//    Optimizer Balances After :
//        > Share : ${optimizerShareBal_after}
//    =======================================
//    `
//);