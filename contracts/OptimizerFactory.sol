// "SPDX-License-Identifier: UNLICENSED"

pragma solidity >=0.7.0 <0.8.0;

import "./Optimizer.sol";

contract OptimizerFactory is Ownable {
    address[] public optimizers;
    Protocol[] public protocols;

    struct Protocol {
        uint256 protocolId;
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
        return address(optimizer);
    }

    function harvestAll() external {
        require(optimizerByOwner[msg.sender].length > 0);
        address[] memory ownerOptimizers = optimizerByOwner[msg.sender];
        for (uint i = 0; i < ownerOptimizers.length; i++) {
            Optimizer(ownerOptimizers[i]).harvest();
        }
    }

    function addProtocol(
        address _LP,
        address _share,
        address _dollar,
        address _shareRewardPool,
        address _boardroom
    ) external onlyOwner returns(uint256){
        Protocol memory newProtocol;
        newProtocol.protocolId = protocols.length;
        newProtocol.LP = _LP;
        newProtocol.share = _share;
        newProtocol.dollar = _dollar;
        newProtocol.shareRewardPool = _shareRewardPool;
        newProtocol.boardroom = _boardroom;
        protocols.push(newProtocol);
        return newProtocol.protocolId;
    }

    function getOptimizerCount() external view returns(uint) {
        return optimizers.length;
    } 
    
    function getProtocolCount() external view returns(uint) {
        return protocols.length;
    }

}



