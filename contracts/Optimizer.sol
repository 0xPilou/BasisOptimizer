// "SPDX-License-Identifier: UNLICENSED"
pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/utils/Context.sol';
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';


interface IShareRewardPool {
    function deposit(uint256 _pid, uint256 _amount) external;
    function withdraw(uint256 _pid, uint256 _amount) external;
    function pendingShare(uint256 _pid, address _user) external view returns (uint256);

}

interface IBoardroom {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimReward() external;
    function earned(address director) external view returns (uint256);
    function canWithdraw(address director) external view returns (bool);
    function canClaimReward(address director) external view returns (bool);
}

interface IPancakeRouter {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function swapExactTokensForTokens(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external returns (uint[] memory amounts);
}




contract Optimizer is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    
    uint256 constant MAX_INT = 2**256 - 1;

    /**
     * @dev Interfacing contracts addresses
     */
    address public shareRewardPoolAddr;
    address public boardroomAddr;
    address public pancakeRouter = 0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F;
    
    /**
     * @dev Tokens addresses
     */    
    address public LP;
    address public share;
    address public dollar;
    address public BUSD = 0xf8e81D47203A594245E36C48e151709F0C19fBe8;
    
    /**
     * @dev Token swap route addresses 
     */    
    address[] public dollarToBUSDRoute;
    address[] public BUSDToDollarRoute;

    uint256 public LpStaked = 0;
    uint256 public shareStaked = 0;

    /**
     * @dev Initializes the strategy for the given protocol
     */
    constructor(address _LP, address _share, address _dollar, address _shareRewardPool, address _boardroom) {
        LP = _LP;
        share = _share;
        dollar = _dollar;
        shareRewardPoolAddr = _shareRewardPool;
        boardroomAddr = _boardroom;
        dollarToBUSDRoute = [_dollar, BUSD];
        BUSDToDollarRoute = [BUSD, _dollar];
        
        IERC20(LP).safeApprove(shareRewardPoolAddr, 0);
        IERC20(LP).safeApprove(shareRewardPoolAddr, MAX_INT);
        IERC20(share).safeApprove(boardroomAddr, 0);
        IERC20(share).safeApprove(boardroomAddr, MAX_INT);
        IERC20(dollar).safeApprove(pancakeRouter, 0);
        IERC20(dollar).safeApprove(pancakeRouter, MAX_INT);
        IERC20(BUSD).safeApprove(pancakeRouter, 0);
        IERC20(BUSD).safeApprove(pancakeRouter, MAX_INT);
        
    }

    function depositLP(uint256 _amount) external onlyOwner {
        require(IERC20(LP).balanceOf(address(msg.sender)) >= _amount);
        IERC20(LP).safeTransferFrom(msg.sender, address(this), _amount);
        _depositAllLP();
    }
    

    function withdrawLP(uint256 _amount) external onlyOwner {
        _withdrawLP(_amount);
        IERC20(LP).safeTransfer(msg.sender, _amount);
    }

    function depositShare(uint256 _amount) external onlyOwner {
        require(IERC20(share).balanceOf(address(msg.sender)) >= _amount);
        IERC20(share).safeTransferFrom(msg.sender, address(this), _amount);
        _stakeAllShare();
    }
    
    function withdrawShare() external onlyOwner {
        _withdrawAllShare();
        IERC20(share).safeTransfer(msg.sender, IERC20(share).balanceOf(address(this)));
    }

    function harvest() external onlyOwner {
        _claimDollar();
        _splitDollarToBUSD();
        _mintLP();
        _depositAllLP();
        _stakeAllShare();
    }
   
    function exitAvalanche() external onlyOwner {
        _withdrawLP(LpStaked);
        _withdrawAllShare();
        if(IERC20(LP).balanceOf(address(this)) > 0){
            IERC20(LP).safeTransfer(msg.sender, IERC20(LP).balanceOf(address(this)));
        }
        if(IERC20(share).balanceOf(address(this)) > 0){
            IERC20(share).safeTransfer(msg.sender, IERC20(share).balanceOf(address(this)));
        }
        if(IERC20(dollar).balanceOf(address(this)) > 0){
            IERC20(dollar).safeTransfer(msg.sender, IERC20(dollar).balanceOf(address(this)));
        }
        if(IERC20(BUSD).balanceOf(address(this)) > 0){
            IERC20(BUSD).safeTransfer(msg.sender, IERC20(BUSD).balanceOf(address(this)));
        }
    }
    

    function getPendingRewards() external view onlyOwner returns(uint256, uint256) {
        uint256 shareReward = IShareRewardPool(shareRewardPoolAddr).pendingShare(0, address(this));
        uint256 dollarReward = IBoardroom(boardroomAddr).earned(address(this));
        return (shareReward, dollarReward);
    }

    function canClaimDollar() external view onlyOwner returns(bool) {
        return IBoardroom(boardroomAddr).canClaimReward(address(this));
    }

    function canWithdrawShare() external view onlyOwner returns(bool) {
        return IBoardroom(boardroomAddr).canWithdraw(address(this));
    }


    function _depositAllLP() internal {
        LpStaked = LpStaked.add(IERC20(LP).balanceOf(address(this)));
        IShareRewardPool(shareRewardPoolAddr).deposit(0, IERC20(LP).balanceOf(address(this)));
    }

    function _withdrawLP(uint256 _amount) internal {
        IShareRewardPool(shareRewardPoolAddr).withdraw(0, _amount);
        LpStaked = LpStaked.sub(_amount);
    }

    function _claimShare() internal {
        if(LpStaked > 0) {
            IShareRewardPool(shareRewardPoolAddr).withdraw(0, 0);
        }
    } 
    
    function _stakeAllShare() internal {
        if(IERC20(share).balanceOf(address(this)) > 0) {
            shareStaked = shareStaked.add(IERC20(share).balanceOf(address(this)));
            IBoardroom(boardroomAddr).stake(IERC20(share).balanceOf(address(this)));
        }
    }
    
    function _withdrawAllShare() internal {
        if(shareStaked > 0) {
            IBoardroom(boardroomAddr).withdraw(shareStaked);
            shareStaked = 0;
        }    
    }  
    
    function _claimDollar() internal {
        if(shareStaked > 0) {
            IBoardroom(boardroomAddr).claimReward();   
        }
    }

    function _splitDollarToBUSD() internal {
        if(IERC20(dollar).balanceOf(address(this)) > 0){
            uint256 dollarSplit = IERC20(dollar).balanceOf(address(this)).div(2);
            IPancakeRouter(pancakeRouter).swapExactTokensForTokens(dollarSplit, 0, dollarToBUSDRoute, address(this), block.timestamp.add(600));            
        }
    }

    function _splitBUSDToDollar() internal {
        if(IERC20(BUSD).balanceOf(address(this)) > 0){
            uint256 BUSDsplit = IERC20(BUSD).balanceOf(address(this)).div(2);
            IPancakeRouter(pancakeRouter).swapExactTokensForTokens(BUSDsplit, 0, BUSDToDollarRoute, address(this), block.timestamp.add(600));            
        }
    }

    function _mintLP() internal {
        uint256 dollarBal = IERC20(dollar).balanceOf(address(this));
        uint256 busdBal = IERC20(BUSD).balanceOf(address(this));
        IPancakeRouter(pancakeRouter).addLiquidity(address(IERC20(dollar)), address(IERC20(BUSD)), dollarBal, busdBal, 1, 1, address(this), block.timestamp.add(600));
    }
}    
