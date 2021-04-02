import React, { useState, useEffect } from 'react';
import getBlockchain from './ethereum.js';

function App() {
  const [optimizerFactory, setOptimizerFactory] = useState(undefined);
  const [protocolCount, setProtocolCount] = useState(undefined);
  const [optimizerCount, setOptimizerCount] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { optimizerFactory } = await getBlockchain();
      const protocolCount = await optimizerFactory.getProtocolCount();
      const optimizerCount = await optimizerFactory.getOptimizerCount();

      setOptimizerFactory(optimizerFactory);
      setProtocolCount(protocolCount);
      setOptimizerCount(optimizerCount);


      
    };
    init();
  }, []);

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

  if(
    typeof optimizerFactory === 'undefined'
    || typeof protocolCount === 'undefined'
    || typeof optimizerCount === 'undefined'

  ) {
    return 'Loading...';
  }

  return (
    <div className='container'>
      <div className='row'>

        <div className='col-sm-6'>
          <h2>Protocols:</h2>
          <h3>Supported:</h3>
          <p>{protocolCount.toString()}</p>
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
        </div>
        <div className='col-sm-6'>
          <h2>Optimizers:</h2>
          <h3>Created by the Factory:</h3>
          <p>{optimizerCount.toString()}</p>
          <h2>Create Optimizer</h2>
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
        </div>

      </div>
    </div>
  );
}

export default App;