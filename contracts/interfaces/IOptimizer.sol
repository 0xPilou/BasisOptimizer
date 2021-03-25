// "SPDX-License-Identifier: UNLICENSED"
pragma solidity >=0.7.0 <0.8.0;

interface IOptimizer {

    function depositLP(uint256 _amount) external;

    function withdrawLP(uint256 _amount) external;

    function depositShare(uint256 _amount) external;
    
    function withdrawShare() external;

    function harvest() external;

    function exitAvalanche() external;

    function getPendingRewards() external view returns(uint256, uint256);

    function canClaimDollar() external view returns(bool);

    function canWithdrawShare() external view returns(bool);
}
    