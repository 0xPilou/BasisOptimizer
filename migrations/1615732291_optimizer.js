const LP = artifacts.require("LP");
const Share = artifacts.require("Share");
const Dollar = artifacts.require("Dollar");

const ShareRewardPoolMock = artifacts.require("ShareRewardPoolMock");
const BoardroomMock = artifacts.require("BoardroomMock");
const OptimizerFactory = artifacts.require("OptimizerFactory");


module.exports = function (deployer, network, accounts) {
  const owner = accounts[0];
  deployer.deploy(ShareRewardPoolMock, {overwrite: true});
  deployer.deploy(BoardroomMock, {overwrite: true});
  deployer.deploy(OptimizerFactory, {overwrite: true});
  deployer.deploy(LP, "Cake-LP bDollar", "BDO-BUSD");
  deployer.deploy(Share, "Share bDollar", "sBDO");
  deployer.deploy(Dollar, "Dollar bDollar", 'BDO');

};
