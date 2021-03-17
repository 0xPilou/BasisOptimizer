pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';


contract ShareRewardPoolMock {

    using SafeERC20 for IERC20;

    IERC20 bdoBusdLp = IERC20(0xd9145CCE52D386f254917e481eB44e9943F39138);
    IERC20 sbdo = IERC20(0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8);

    function deposit(uint256 _pid, uint256 _amount) external {
        address _sender = msg.sender;
        bdoBusdLp.transferFrom(_sender, address(this), _amount);
    }

    // Withdraw LP tokens.
    function withdraw(uint256 _pid, uint256 _amount) external {
        if (_amount > 0) {
            bdoBusdLp.transfer(msg.sender, _amount);
            if(sbdo.balanceOf(address(this)) > 0) {
                sbdo.transfer(msg.sender, sbdo.balanceOf(address(this))/100);
            }
        } else {
            sbdo.transfer(msg.sender, sbdo.balanceOf(address(this))/100);
        }
    }

        function pendingShare(uint256 _pid, address _user) external view returns (uint256){
            return 888888888888888;
        }
}