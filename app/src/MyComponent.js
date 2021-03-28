import React from 'react';
import { 
    AccountData,
    ContractData,
    ContractForm
} from '@drizzle/react-components';


const MyComponent = () => (
    <div>
        <h2> Balance of first account</h2>
        <AccountData accountIndex={0} units={"ether"} precision={3} />
      
        <h2>createOptimizer()</h2>
        <ContractForm 
            contract="OptimizerFactory"
            method="createOptimizer"
            labels={['value of protocol ID']} />

        <h2>Number of Optimizers created by the factory :</h2>
        <ContractData contract="OptimizerFactory" method="getOptimizerCount" />
       
        <h2>Add a new supported protocol :</h2>
        <ContractForm 
            contract="OptimizerFactory"
            method="addProtocol"
            sendArgs={{gas:3000000000000}}
            labels={[
                'LP Token Address :',
                'Share Token Address :',
                'Dollar Token Address:',
                'Share Reward Pool Address :',
                'Boardroom Address :'
            ]} />

        <h2>Number of Protocol Supported :</h2>
        <ContractData contract="OptimizerFactory" method="getProtocolCount" />    

    </div>
);

export default MyComponent;