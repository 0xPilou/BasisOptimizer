pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';


contract BoardroomMock {
    
    using SafeERC20 for IERC20;


    address share;
    address dollar;

    constructor(address _share, address _dollar) {
        share = _share;
        dollar = _dollar;
    }
    function stake(uint256 _amount) public {
        IERC20(share).transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 amount) public {
        IERC20(share).transfer(msg.sender, amount);
    }

    function claimReward() public {
        IERC20(dollar).transfer(msg.sender, IERC20(dollar).balanceOf(address(this))/100);
    }
    
}