
/**
 *  Mock Contracts
 */
const LP = artifacts.require("LP");
const Share = artifacts.require("Share");
const Dollar = artifacts.require("Dollar");
const ShareRewardPoolMock = artifacts.require("ShareRewardPoolMock");
const BoardroomMock = artifacts.require("BoardroomMock");

/**
 *  Contracts Under Tests
 */
const Optimizer = artifacts.require("Optimizer");
const OptimizerFactory = artifacts.require("OptimizerFactory");


module.exports = (deployer, network, [owner]) => deployer
  .then(() => deployOptimizerFactory(deployer))
  .then(() => deployOptimizer(deployer))
  .then(() => displaySummary(owner));


async function deployOptimizer(deployer) {
  const lp = (await LP.deployed());
  const share = (await Share.deployed());
  const dollar = (await Dollar.deployed());
  const boardroomMock = (await BoardroomMock.deployed());
  const shareRewardPoolMock = (await ShareRewardPoolMock.deployed());
  return deployer.deploy(Optimizer, lp.address, share.address, dollar.address, shareRewardPoolMock.address, boardroomMock.address);
}


function deployOptimizerFactory(deployer) {
  return deployer.deploy(OptimizerFactory);
}

async function displaySummary(owner) {
  const lp = (await LP.deployed());
  const share = (await Share.deployed());
  const dollar = (await Dollar.deployed());
  const boardroomMock = (await BoardroomMock.deployed());
  const shareRewardPoolMock = (await ShareRewardPoolMock.deployed());
  const optimizerFactory = (await OptimizerFactory.deployed());
  const optimizer = (await Optimizer.deployed());


  console.log(
    `===================================================

    Deployed Contracts Addresses :

        > LP :                  ${lp.address}
        > Share :               ${share.address}
        > Dollar :              ${dollar.address}
        > Boardroom :           ${boardroomMock.address}
        > Share Reward Pool :   ${shareRewardPoolMock.address}
        > Optimizer Factory :   ${optimizerFactory.address}
        > Optimizer :           ${optimizer.address}

    ===================================================

    Balances:

        > Owner :
            LP :      ${web3.utils.fromWei(await lp.balanceOf(owner))}
            Share :   ${web3.utils.fromWei(await share.balanceOf(owner))}
            Dollar :  ${web3.utils.fromWei(await dollar.balanceOf(owner))}

        > Share Reward Pool :
            LP :      ${web3.utils.fromWei(await lp.balanceOf(shareRewardPoolMock.address))}
            Share :   ${web3.utils.fromWei(await share.balanceOf(shareRewardPoolMock.address))}
            Dollar :  ${web3.utils.fromWei(await dollar.balanceOf(shareRewardPoolMock.address))}

        > Boardroom :
            LP :      ${web3.utils.fromWei(await lp.balanceOf(boardroomMock.address))}
            Share :   ${web3.utils.fromWei(await share.balanceOf(boardroomMock.address))}
            Dollar :  ${web3.utils.fromWei(await dollar.balanceOf(boardroomMock.address))}

        > Optimizer Factory :
            LP :      ${web3.utils.fromWei(await lp.balanceOf(optimizerFactory.address))}
            Share :   ${web3.utils.fromWei(await share.balanceOf(optimizerFactory.address))}
            Dollar :  ${web3.utils.fromWei(await dollar.balanceOf(optimizerFactory.address))}

        > Optimizer :
            LP :      ${web3.utils.fromWei(await lp.balanceOf(optimizer.address))}
            Share :   ${web3.utils.fromWei(await share.balanceOf(optimizer.address))}
            Dollar :  ${web3.utils.fromWei(await dollar.balanceOf(optimizer.address))}                                    


    ===================================================`);
}