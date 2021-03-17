// "SPDX-License-Identifier: UNLICENSED"

pragma solidity >=0.7.0 <0.8.0;

import "./Optimizer.sol";

contract OptimizerFactory {
    address[] public optimizers;
    Protocol[] public protocols;

    struct Protocol {
        string name;
        address LP;
        address share;
        address dollar;
        address shareRewardPool;
        address boardroom;
    }
    
    mapping(address => address[]) public optimizerByOwner; 

    function createOptimizer(uint256 _protocolId) external returns(address newOptimizer) {
        Protocol memory protocol = protocols[_protocolId];
        Optimizer optimizer = new Optimizer(protocol.LP, protocol.share, protocol.dollar, protocol.shareRewardPool, protocol.boardroom);
        optimizers.push(address(optimizer));
        optimizerByOwner[msg.sender].push(address(optimizer));
        optimizer.transferOwnership(msg.sender);
        optimizer.renounceOwnership();
        return address(optimizer);
    }

    function getOptimizerCount() external view returns(uint optimizerCount) {
        return optimizers.length;
    } 
    
    function harvestAll() external {
        require(optimizerByOwner[msg.sender].length > 0);
        address[] memory ownerOptimizers = optimizerByOwner[msg.sender];
        for (uint i = 0; i < ownerOptimizers.length; i++) {
            Optimizer(ownerOptimizers[i]).harvest();
        }
    }

}



