import React from 'react';
import { 
    AccountData,
    ContractData,
    ContractForm
} from '@drizzle/react-components';
import Header from './components/Header'


const OptimizerFactoryComponent = () => (
    <div>
        <Header />
        <h1> Optimizer Factory :</h1>
        <ul>
            <h2> Create New Optimizer :</h2>
            <ContractForm 
                contract="OptimizerFactory"
                method="createOptimizer"
                sendArgs={{gas:6500000}}    //Only for testing (not required for mainnet)
                labels={['Protocol ID']} />

            <h2>Total number of Optimizers created by the factory :</h2>
            <ContractData contract="OptimizerFactory" method="getOptimizerCount" />
        </ul>    
        <h1> Factory Settings :</h1>
        <ul>
            <h2>Add a new supported protocol :</h2>
            <ContractForm 
                contract="OptimizerFactory"
                method="addProtocol"
                sendArgs={{gas:6500000}}    //Only for testing (not required for mainnet)
                labels={[
                    'LP Token Address :',
                    'Share Token Address :',
                    'Dollar Token Address:',
                    'Share Reward Pool Address :',
                    'Boardroom Address :'
                ]} />

            <h2>Number of Protocol Supported :</h2>
            <ContractData contract="OptimizerFactory" method="getProtocolCount" />
        </ul>    
    </div>
);

export default OptimizerFactoryComponent;