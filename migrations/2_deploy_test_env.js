const LP = artifacts.require("LP");
const Share = artifacts.require("Share");
const Dollar = artifacts.require("Dollar");

const ShareRewardPoolMock = artifacts.require("ShareRewardPoolMock");
const BoardroomMock = artifacts.require("BoardroomMock");


module.exports = (deployer, network, [owner]) => deployer
  .then(() => deployLP(deployer))
  .then(() => deployShare(deployer))
  .then(() => deployDollar(deployer))
  .then(() => deployBoardroom(deployer))
  .then(() => deployShareRewardPool(deployer))
  .then(() => transferShareToShareRewardPool(owner))
  .then(() => transferDollarToBoardroom(owner))
  .then(() => displaySummary(owner));


function deployLP(deployer) {
  return deployer.deploy(LP, "Cake-LP bDollar", "BDO-BUSD");
}
function deployShare(deployer) {
  return deployer.deploy(Share, "Share bDollar", "sBDO");
}
function deployDollar(deployer) {
  return deployer.deploy(Dollar, "Dollar bDollar", "BDO");
}
async function deployBoardroom(deployer) {
  const share = (await Share.deployed());
  const dollar = (await Dollar.deployed());
  return deployer.deploy(BoardroomMock, share.address, dollar.address);
}
async function deployShareRewardPool(deployer) {
  const lp = (await LP.deployed());
  const share = (await Share.deployed());
  return deployer.deploy(ShareRewardPoolMock, lp.address, share.address);
}

async function transferShareToShareRewardPool(owner) {
  const share = (await Share.deployed());
  const shareRewardPoolMock = (await ShareRewardPoolMock.deployed());
  var amountToTransfer = (await share.balanceOf(owner));
  return share.transfer(shareRewardPoolMock.address, amountToTransfer);
}

async function transferDollarToBoardroom(owner) {
  const dollar = (await Dollar.deployed());
  const boardroomMock = (await BoardroomMock.deployed());
  var amountToTransfer = (await dollar.balanceOf(owner));
  return dollar.transfer(boardroomMock.address, amountToTransfer);
}

async function displaySummary(owner) {
  const lp = (await LP.deployed());
  const share = (await Share.deployed());
  const dollar = (await Dollar.deployed());
  const boardroomMock = (await BoardroomMock.deployed());
  const shareRewardPoolMock = (await ShareRewardPoolMock.deployed());

  console.log(
    `===================================================
    Deployed Contracts Addresses :

        > LP :                  ${lp.address}
        > Share :               ${share.address}
        > Dollar :              ${dollar.address}
        > Boardroom :           ${boardroomMock.address}
        > Share Reward Pool :   ${shareRewardPoolMock.address}

    ===================================================
    Balances:

        > Owner :
            LP :      ${await lp.balanceOf(owner)}
            Share :   ${await share.balanceOf(owner)}
            Dollar :  ${await dollar.balanceOf(owner)}

        > Share Reward Pool :
            LP :      ${await lp.balanceOf(shareRewardPoolMock.address)}
            Share :   ${await share.balanceOf(shareRewardPoolMock.address)}
            Dollar :  ${await dollar.balanceOf(shareRewardPoolMock.address)}

        > Boardroom :
            LP :      ${await lp.balanceOf(boardroomMock.address)}
            Share :   ${await share.balanceOf(boardroomMock.address)}
            Dollar :  ${await dollar.balanceOf(boardroomMock.address)}

    ===================================================`);
}