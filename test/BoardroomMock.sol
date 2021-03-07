pragma solidity >=0.7.0 <0.8.0;

import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/token/ERC20/SafeERC20.sol';


contract BoardroomMock {
    
    using SafeERC20 for IERC20;


    IERC20 sbdo = IERC20(0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8);
    IERC20 bdo = IERC20(0xf8e81D47203A594245E36C48e151709F0C19fBe8);

    function stake(uint256 _amount) public {
        sbdo.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 amount) public {
        sbdo.transfer(msg.sender, amount);
    }

    function claimReward() public {
        bdo.transfer(msg.sender, bdo.balanceOf(address(this)));
    }
    
}