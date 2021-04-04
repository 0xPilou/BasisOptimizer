// "SPDX-License-Identifier: UNLICENSED"

pragma solidity >=0.7.0 <0.8.0;

interface IOptimizerFactory {

    function createOptimizer(uint256 _protocolId) external returns(address newOptimizer);

    function harvestAll() external;

    function addProtocol(
        address _LP,
        address _share,
        address _dollar,
        address _shareRewardPool,
        address _boardroom
    ) external returns(uint256);

    function getOptimizerCount() external view returns(uint);
    
    function getProtocolCount() external view returns(uint);

    function getOwnerOptimizers(address _owner) external view returns(address[] memory) ;

}



