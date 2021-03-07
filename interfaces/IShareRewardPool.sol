pragma solidity >=0.7.0 <0.8.0;

// https://bdollar.fi/shares

// _pid is the pool id 
// (BDO/BUSD = 0, sBDO/BUSD = 1 (?), BDO/BNB = 2 (?) )
interface IShareRewardPool {
    
    // deposit an _amount of LP token in the Pool _pid
    function deposit(uint256 _pid, uint256 _amount) external;

    // withdraw an _amount of LP token from the Pool _pid and claim the rewards (in sBDO)
    // tip : _amount = 0 --> will only claim the rewards
    function withdraw(uint256 _pid, uint256 _amount) external;

    // withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external;

    // View function to see pending sBDOs
    function pendingShare(uint256 _pid, address _user) external view returns (uint256);
}