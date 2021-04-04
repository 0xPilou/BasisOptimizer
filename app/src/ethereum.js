import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import OptimizerFactory from './contracts/OptimizerFactory.json';
import Optimizer from './contracts/Optimizer.json';


const getBlockchain = () =>
  new Promise( async (resolve, reject) => {
    let provider = await detectEthereumProvider();
    if(provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })
      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      const optimizerFactory = new Contract(
        OptimizerFactory.networks[networkId].address,
        OptimizerFactory.abi,
        signer
      );
      resolve({optimizerFactory});
      return;
    }
    reject('Install Metamask');
  });

//const getAccounts = () =>
//  new Promise( async (resolve) => {
//    let provider = await detectEthereumProvider();
//    provider = new ethers.providers.Web3Provider(provider);
//    const signer = provider.getAccounts();
//  });

export default getBlockchain;
