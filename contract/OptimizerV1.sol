pragma solidity >=0.7.0 <0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/math/SafeMath.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/utils/Context.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/utils/Pausable.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/access/Ownable.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/token/ERC20/SafeERC20.sol';


interface IShareRewardPool {
    function deposit(uint256 _pid, uint256 _amount) external;
    function withdraw(uint256 _pid, uint256 _amount) external;
}

interface IBoardroom {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimReward() external;
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

contract OptimizerV1 is Ownable, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    
    uint256 MAX_INT = 2**256 - 1;

    /**
     * @dev Interfacing contracts addresses
     */
    address public shareRewardPoolAddr;
    address public boardroomAddr;
    address public pancakeRouter;
    
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


    mapping(address => uint) public shareBalances;
    mapping(address => uint) public LPBalances;
    
    uint256 public LpStaked = 0;
    uint256 public shareStaked = 0;
    uint8 public poolId = 0;

    /**
     * @dev Initializes the strategy for the given protocol
     */
    constructor(address _LP, address _share, address _dollar, address _shareRewardPool, address _boardroom, address _pancakeRouter) {
        LP = _LP;
        share = _share;
        dollar = _dollar;
        shareRewardPoolAddr = _shareRewardPool;
        boardroomAddr = _boardroom;
        pancakeRouter = _pancakeRouter;
       dollarToBUSDRoute = [_dollar, BUSD];
        
        IERC20(LP).safeApprove(shareRewardPoolAddr, 0);
        IERC20(LP).safeApprove(shareRewardPoolAddr, MAX_INT);
        IERC20(share).safeApprove(boardroomAddr, 0);
        IERC20(share).safeApprove(boardroomAddr, MAX_INT);
        IERC20(dollar).safeApprove(pancakeRouter, 0);
        IERC20(dollar).safeApprove(pancakeRouter, MAX_INT);
        IERC20(BUSD).safeApprove(pancakeRouter, 0);
        IERC20(BUSD).safeApprove(pancakeRouter, MAX_INT);
        
    }


    function contractDepositAllLP() internal {
        LpStaked = LpStaked.add(IERC20(LP).balanceOf(address(this)));
        IShareRewardPool(shareRewardPoolAddr).deposit(poolId, IERC20(LP).balanceOf(address(this)));
    }

    function contractWithdrawLP(uint256 _amount) internal {
        IShareRewardPool(shareRewardPoolAddr).withdraw(poolId, _amount);
        LpStaked = LpStaked.sub(_amount);
    }

    function contractClaimShare() internal {
        if(LpStaked > 0) {
            IShareRewardPool(shareRewardPoolAddr).withdraw(poolId, 0);
        }
    }
    
    function userDepositLP(uint256 _amount) external onlyOwner {
        require(IERC20(LP).balanceOf(address(msg.sender)) >= _amount);
        IERC20(LP).safeTransferFrom(msg.sender, address(this), _amount);
        LPBalances[msg.sender] = LPBalances[msg.sender].add(_amount);
        contractDepositAllLP();
    }
    

    function userWithdrawLP(uint256 _amount) external onlyOwner {
        require(LPBalances[address(msg.sender)] >= _amount);
        contractWithdrawLP(_amount);
        IERC20(LP).safeTransfer(msg.sender, _amount);
        LPBalances[address(msg.sender)] = LPBalances[address(msg.sender)].sub(_amount);
    }
    
    
    function contractStakeAllShare() internal {
        if(IERC20(share).balanceOf(address(this)) > 0) {
            shareStaked = shareStaked.add(IERC20(share).balanceOf(address(this)));
            IBoardroom(boardroomAddr).stake(IERC20(share).balanceOf(address(this)));
        }
    }
    
    function contractWithdrawAllShare() internal {
        if(shareStaked > 0) {
            IBoardroom(boardroomAddr).withdraw(shareStaked);
            shareStaked = 0;
        }    
    }

    function userDepositShare(uint256 _amount) external onlyOwner {
        require(IERC20(share).balanceOf(address(msg.sender)) >= _amount);
        IERC20(share).safeTransferFrom(msg.sender, address(this), _amount);
        contractStakeAllShare();
    }
    
    function userWithdrawShare() external onlyOwner {
        contractWithdrawAllShare();
        IERC20(share).safeTransfer(msg.sender, IERC20(share).balanceOf(address(this)));
    }
    
    
    function contractClaimDollar() external onlyOwner {
        if(shareStaked > 0) {
            IBoardroom(boardroomAddr).claimReward();   
        }
    }


    function compoundShare() external onlyOwner {
        contractClaimShare();
        contractStakeAllShare();
    }


    function harvest() external onlyOwner {
        //contractClaimDollar();
        uint256 dollarSplit = IERC20(dollar).balanceOf(address(this)).div(2);
        IPancakeRouter(pancakeRouter).swapExactTokensForTokens(dollarSplit, 0, dollarToBUSDRoute, address(this), block.timestamp.add(600));
        uint256 dollarBal = IERC20(dollar).balanceOf(address(this));
        uint256 busdBal = IERC20(BUSD).balanceOf(address(this));
        IPancakeRouter(pancakeRouter).addLiquidity(address(IERC20(dollar)), address(IERC20(BUSD)), dollarBal, busdBal, 1, 1, address(this), block.timestamp.add(600));
        contractDepositAllLP();
        contractStakeAllShare();
    }
    
    function exitAvalanche() external onlyOwner {
        contractWithdrawLP(LpStaked);
        contractWithdrawAllShare();
        IERC20(LP).safeTransfer(msg.sender, IERC20(LP).balanceOf(address(this)));
        IERC20(share).safeTransfer(msg.sender, IERC20(share).balanceOf(address(this)));
    }
    
    function withdrawLP() external onlyOwner {
        IERC20(LP).safeTransfer(msg.sender, IERC20(LP).balanceOf(address(this)));
    }
    
    function withdrawShare() external onlyOwner {
        IERC20(share).safeTransfer(msg.sender, IERC20(share).balanceOf(address(this)));
    }
    
    function withdrawDollar() external onlyOwner {
        IERC20(dollar).safeTransfer(msg.sender, IERC20(dollar).balanceOf(address(this)));
    }
    
    function withdrawBUSD() external onlyOwner {
        IERC20(BUSD).safeTransfer(msg.sender, IERC20(BUSD).balanceOf(address(this)));
    }


    function pause() public onlyOwner {
        _pause();

        IERC20(LP).safeApprove(shareRewardPoolAddr, 0);
        IERC20(share).safeApprove(boardroomAddr, 0);
        IERC20(dollar).safeApprove(pancakeRouter, 0);
        IERC20(BUSD).safeApprove(pancakeRouter, 0);
    }

    function unpause() external onlyOwner {
        _unpause();
        IERC20(LP).safeApprove(shareRewardPoolAddr, MAX_INT);
        IERC20(share).safeApprove(boardroomAddr, MAX_INT);
        IERC20(dollar).safeApprove(pancakeRouter, MAX_INT);
        IERC20(BUSD).safeApprove(pancakeRouter, MAX_INT);
    }
}    
