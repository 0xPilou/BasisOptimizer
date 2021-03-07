pragma solidity >=0.7.0 <0.8.0;

// https://bdollar.fi/boardroom
interface IBoardroom {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimReward() external;
}
