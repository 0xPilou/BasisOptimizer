import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import OptimizerFactory from './contracts/OptimizerFactory.json';
import Optimizer from './contracts/Optimizer.json';
import getBlockchain from './ethereum.js';


function App2() {
  const [optimizerFactory, setOptimizerFactory] = useState(undefined);
  const [protocolCount, setProtocolCount] = useState(undefined);
  const [optimizerCount, setOptimizerCount] = useState(undefined);
  const [optimizer, setOptimizer] = useState(undefined);
  const [optimizers = [], setOptimizers] = useState(undefined);

  var [protocols = [], setProtocols] = useState(undefined);
  var [userOptimizers = [], setUserOptimizers] = useState(undefined);
  var [signerAddr, setSignerAddr] = useState(undefined);
  var [LpStaked = [], setLpStaked] = useState(undefined);
  var [shareStaked = [], setShareStaked] = useState(undefined);
  var [LpBalance = [], setLpBalance] = useState(undefined);
  var [shareBalance = [], setShareBalance] = useState(undefined);
  var [dollarBalance = [], setDollarBalance] = useState(undefined);

  
  const ERC20ABI = [
    // Read-Only Functions
    "function balanceOf(address account) external view returns (uint256)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function approve(address spender, uint256 amount) external returns (bool)"
  ]

  useEffect(() => {
    const init = async () => {
      // Connect to Metamask
      var provider = await detectEthereumProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })
      provider = new ethers.providers.Web3Provider(provider);


      // Get User account info
      const signer = provider.getSigner();
      const signerAddr = await signer.getAddress();
      console.log(signerAddr);
      //LpBalance = await 



      // Instanciate an object representing the deployed Optimizer Factory 
      const optimizerFactory = new Contract(
        OptimizerFactory.networks[networkId].address,
        OptimizerFactory.abi,
        signer
      );

      // (Trying to) Read Optimizer Factory public variable : Protocols
      const protocolCount = await optimizerFactory.getProtocolCount();
      // get all protocols supported
      var i;
      for (i = 0; i < protocolCount; i++) {
        const protocol = await optimizerFactory.protocols(i);
        protocols.push(protocol);
        // console.log(protocols[i].protocolId.toString());
      }
      

      //console.log(protocols.protocolId.toString());


      // (Trying to) Read Optimizer Factory public variable : Optimizers
      const optimizerCount = await optimizerFactory.getOptimizerCount();
      userOptimizers = await optimizerFactory.getOwnerOptimizers(signerAddr);
      //console.log()

      if (userOptimizers.length > 0) {
      var i = 0
      var buffer;
      let optimizers = [];

        for (i = 0; i < userOptimizers.length; i++) {
          const optimizer = new Contract(
            userOptimizers[i].toString(),
            Optimizer.abi,
            signer
          );
          buffer = await optimizer.LpStaked();
          LpStaked.push(buffer.toString());
          console.log('LP Stake for Optimizer' ,i , ': ', LpStaked[i]);
          
          buffer = await optimizer.shareStaked();
          shareStaked.push(buffer.toString());
          console.log('Share Stake for Optimizer' ,i , ': ', shareStaked[i]);


          var LpAddr = await optimizer.LP();
          LpAddr = LpAddr.toString();
          const LpContract = new Contract(
            LpAddr,
            ERC20ABI,
            signer
          );
          console.log('LP Address :', LpAddr.toString())
          
          buffer = await LpContract.balanceOf(signerAddr);
          LpBalance.push(buffer.toString())
          console.log('LP Balance: ', LpBalance[i]);

          var shareAddr = await optimizer.share();
          shareAddr = shareAddr.toString();
          const shareContract = new Contract(
            shareAddr,
            ERC20ABI,
            signer
          );
          console.log('Share Address :', shareAddr.toString())
          
          buffer = await shareContract.balanceOf(signerAddr);
          shareBalance.push(buffer.toString())
          console.log('LP Balance: ', shareBalance[i]);
          //await LpContract.approve(optimizer.address, -1);



          const optz = {
            optimizer: optimizer,
            address: userOptimizers[i].toString(),
            LpStaked: LpStaked[i],
            shareStaked: shareStaked[i],
            LpBalance: LpBalance[i],
            shareBalance: shareBalance[i],
          }
          optimizers.push(optz);
          console.log(optz)
          setOptimizers(optimizers);


        }
      }

      // const pendingRewards = await optimizer.getPendingRewards();
      // console.log(pendingRewards.toString());
      // const canClaimDollar = await optimizer.canClaimDollar();
      // console.log(canClaimDollar.toString());
      // const canWithdrawShare = await optimizer.canWithdrawShare();
      // console.log(canWithdrawShare.toString());


      // Set function (for React)
      setSignerAddr(signerAddr);
      setOptimizerFactory(optimizerFactory);
      setProtocolCount(protocolCount);
      setOptimizerCount(optimizerCount);
      setProtocols(protocols);
      setUserOptimizers(userOptimizers);
      //setOptimizer(optimizer);
    // setLpStaked(LpStaked);
    // setShareStaked(shareStaked)
      console.log(optimizers.length)
    };
    init();
  }, []);

  const ProtocolsSupported = ({protocols}) => (
    <>
      {protocols.map((protocol, index) => (
        <li key={index}>Protocol ID : {protocol.protocolId.toString()}
          <ul>
            <li>LP          : {protocol.LP.toString()}</li>
            <li>Share       : {protocol.share.toString()}</li>
            <li>Dollar      : {protocol.dollar.toString()}</li>
            <li>Share Pool  : {protocol.shareRewardPool.toString()}</li>
            <li>Boardroom   : {protocol.boardroom.toString()}</li>
          </ul>
        </li>
      ))}
    </>
  );


  const OptimizersList = ({optimizers}) => (
    <>
      <br/>
      {optimizers.map((optimizer, index) => (
        <li key={index}> Optimizer {index} :
          <br/>
          <ul>
            <li>Address : {optimizer.address}</li>
            <br/>
            <li>LP Tokens: 
              <p> Staked : {optimizer.LpStaked}</p>
              <p> Available : {optimizer.LpBalance}</p>
            </li>
            <li>Share Tokens: 
              <p> Staked : {optimizer.shareStaked}</p>
              <p> Available : {optimizer.shareBalance}</p>
            </li>            
            <br/>
            <h5> Approve LP Token :</h5>
            <form className="form-inline" onSubmit={e => approveLP(optimizer.optimizer)}>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Approve
              </button>
            </form>
            <br/>
            <h5> Deposit LP Token :</h5>
            <form className="form-inline" onSubmit={e => depositLP(e, optimizer.optimizer)}>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Amount to Deposit"
              />                  
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Deposit LP
              </button>
            </form>
            <br/>
            <h5> Withdraw LP Token :</h5>
            <form className="form-inline" onSubmit={e => withdrawLP(e, optimizer.optimizer)}>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Amount to Withdraw"
              />                  
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Withdraw LP
              </button>
            </form>
            <br/>
            <h5> Deposit Share Token :</h5>
            <form className="form-inline" onSubmit={e => depositShare(e, optimizer.optimizer)}>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Amount to Deposit"
              />                  
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Deposit Share
              </button>
            </form>
            <br/>
            <h5> Withdraw All Share Token :</h5>
            <form className="form-inline" onSubmit={e => withdrawAllShare(e, optimizer.optimizer)}>           
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Withdraw Share
              </button>
            </form>
          </ul>
        </li>
      ))}

    </>
  );

  const approveLP = async (e, optimizer) => {
  //  
  //  console.log('ici ', LpContract.balanceOf(optimizer.owner))
//
  //  const tx = await LpContract.approve(optimizer.address, 100);
  //  await tx.wait();
  //  console.log('ici ', LpContract.balanceOf(optimizer.owner))
  };

  const depositLP = async (e, optimizer) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizer.depositLP(data);
    await tx.wait();
  };

  const withdrawLP = async (e, optimizer) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizer.withdrawLP(data);
    await tx.wait();
  };

  const depositShare = async (e, optimizer) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizer.depositShare(data);
    await tx.wait();
  };

  const withdrawAllShare = async (optimizer) => {
    const tx = await optimizer.withdrawShare();
    await tx.wait();
  };


  const createOptimizer = async e => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizerFactory.createOptimizer(data);
    await tx.wait();
    const optimizerCount = await optimizerFactory.getOptimizerCount();
    setOptimizerCount(optimizerCount);
  };

  const addProtocol = async e => {
    e.preventDefault();
    const LP = e.target.elements[0].value;
    const share = e.target.elements[1].value;
    const dollar = e.target.elements[2].value;
    const shareRewardPool = e.target.elements[3].value;
    const boardroom = e.target.elements[4].value;

    const tx = await optimizerFactory.addProtocol(
      LP,
      share,
      dollar,
      shareRewardPool,
      boardroom
    );
    await tx.wait();
    const protocolCount = await optimizerFactory.getProtocolCount();
    setProtocolCount(protocolCount);
  };



  //{protocols.map((protocol) => <li key={protocol.protocolId.toString()}>{protocol}</li>)}


  if(
    typeof optimizerFactory === 'undefined'
    || typeof protocolCount === 'undefined'
    || typeof optimizerCount === 'undefined'
    //|| typeof provider === 'undefined'
    || typeof signerAddr === 'undefined'
    //|| typeof optimizer === 'undefined'
    

  ) {
    return 'Loading...';
  }
  //console.log(protocols[0].protocolId.toString());

  return (
    <div className='container'>
      <header className='header'>
        <h2> You : </h2>
            <p>{signerAddr}</p>            
      </header>
      <br/>
      <div className='row'>        
        <div className='col-sm-6'>                                              
          <h3>Add Protocol:</h3>
          <form className="form-inline" onSubmit={e => addProtocol(e)}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="LP Token Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Share Token Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Dollar Token Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Share Reward Pool Address"
            />               
            <input 
              type="text" 
              className="form-control" 
              placeholder="Boardroom Address"
            />                          
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Submit
            </button>
          </form>
          <br/>
          <br/>
          <h3>Protocols Supported:</h3>
          <ProtocolsSupported protocols={protocols} />  
        </div>
        <div className='col-sm-6'>
          <h2>Optimizers:</h2>
          <h3>Create Optimizer</h3>
          <form className="form-inline" onSubmit={e => createOptimizer(e)}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Protocol ID"
            />                  
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Submit
            </button>
          </form>
          <br/>
          <h3>Created by the Factory: {optimizerCount.toString()}</h3>
          <br/>
          <h3>Your Optimizers:</h3>
          <OptimizersList optimizers={optimizers} />

        </div>

      </div>
    </div>
  );
}

//          <LPs LpStaked = {LpStaked}/>
//          <Shares shareStaked = {shareStaked}/>

export default App2;