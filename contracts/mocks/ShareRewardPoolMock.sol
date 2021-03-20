pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';


contract ShareRewardPoolMock {

    using SafeERC20 for IERC20;

    address lp;
    address share;

    constructor(address _lp, address _share) {
        lp = _lp;
        share = _share;
    }

    function deposit(uint256 _pid, uint256 _amount) external {
        address _sender = msg.sender;
        IERC20(lp).transferFrom(_sender, address(this), _amount);
    }

    // Withdraw LP tokens.
    function withdraw(uint256 _pid, uint256 _amount) external {
        if (_amount > 0) {
            IERC20(lp).transfer(msg.sender, _amount);
            if(IERC20(share).balanceOf(address(this)) > 0) {
                IERC20(share).transfer(msg.sender, IERC20(share).balanceOf(address(this))/100);
            }
        } else {
            IERC20(share).transfer(msg.sender, IERC20(share).balanceOf(address(this))/100);
        }
    }

        function pendingShare(uint256 _pid, address _user) external view returns (uint256){
            return 888888888888888;
        }
}