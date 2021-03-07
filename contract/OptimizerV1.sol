pragma solidity >=0.7.0 <0.8.0;

// import "'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
// import "'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/math/SafeMath.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/utils/Context.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/utils/Pausable.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/access/Ownable.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/token/ERC20/SafeERC20.sol';

import '../interfaces/IPancakeRouter.sol';
import '../interfaces/IShareRewardPool.sol';
import '../interfaces/IBoardroom.sol';



contract OptimizerV1 is Ownable, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    
    uint256 MAX_INT = 2**256 - 1;

    address constant public shareRewardPoolAddr = 0xDA0bab807633f07f013f94DD0E6A4F96F8742B53;
    address constant public boardroomAddr = 0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3;
    address constant public pancakeRouter = 0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F;


    IERC20 tokenLP = IERC20(0xd9145CCE52D386f254917e481eB44e9943F39138);
    IERC20 tokenShare = IERC20(0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8);
    IERC20 tokenDollar = IERC20(0xf8e81D47203A594245E36C48e151709F0C19fBe8);
    IERC20 tokenBUSD = IERC20(0xf8e81D47203A594245E36C48e151709F0C19fBe8);

    IShareRewardPool shareRewardPoolContract = IShareRewardPool(shareRewardPoolAddr);
    IBoardroom boardroomContract = IBoardroom(boardroomAddr);


    address[] public DollarToBUSDRoute = [address(tokenDollar), address(tokenBUSD)];

    mapping(address => uint) public shareBalances;
    mapping(address => uint) public LPBalances;
    
    // Quantity of LP tokens (BDO-BUSD LP) owned by the contract
    uint256 public LpStaked = 0;
    uint256 public shareStaked = 0;


    // @dev Deposit all the BDO-BUSD LP tokens owned by the contract to the target protocol
    function contractDepositAllLP() internal {
        LpStaked = LpStaked.add(tokenLP.balanceOf(address(this)));
        // tokenLP.approve(shareRewardPoolAddr,tokenLP.balanceOf(address(this)));
        shareRewardPoolContract.deposit(0, tokenLP.balanceOf(address(this)));
    }

    // @dev Withdraw an amount of BDO-BUSD LP tokens from the target protocol
    // ...  Withdraw hardcoded to the Pool BDO-BUSD
    // ...  TODO : pass the _pid in parameter
    function contractWithdrawLP(uint256 _amount) internal {
        shareRewardPoolContract.withdraw(0, _amount);
        LpStaked = LpStaked.sub(_amount);
    }

    // @dev Claim rewards from the target protocol
    // ...  Withdraw hardcoded to the Pool BDO-BUSD
    // ...  TODO : pass the _pid in parameter
    function contractClaimShare() internal {
        if(LpStaked > 0) {
            shareRewardPoolContract.withdraw(0, 0);
        }
    }
    

    // @dev user will interact with this function to deposit their BDO-BUSD LP tokens 
    function userDepositLP(uint256 _amount) external onlyOwner {
        require(tokenLP.balanceOf(address(msg.sender)) >= _amount);
        tokenLP.safeTransferFrom(msg.sender, address(this), _amount);
        LPBalances[msg.sender] = LPBalances[msg.sender].add(_amount);
        contractDepositAllLP();
    }
    

    // @dev user will interact with this function to withdraw their _token (this function do not claim the earned sBDO)
    function userWithdrawLP(uint256 _amount) external onlyOwner {
        require(LPBalances[address(msg.sender)] >= _amount);
        contractWithdrawLP(_amount);
        tokenLP.safeTransfer(msg.sender, _amount);
        LPBalances[address(msg.sender)] = LPBalances[address(msg.sender)].sub(_amount);
    }
    
    
    function contractStakeAllShare() internal onlyOwner {
        if(tokenShare.balanceOf(address(this)) > 0) {
            shareStaked = shareStaked.add(tokenShare.balanceOf(address(this)));
            //tokenShare.approve(boardroomAddr,tokenShare.balanceOf(address(this)));
            boardroomContract.stake(tokenShare.balanceOf(address(this)));
        }
    }
    
    function contractWithdrawAllShare() internal {
        if(shareStaked > 0) {
            boardroomContract.withdraw(shareStaked);
            shareStaked = 0;
        }    
    }

    // @dev user will interact with this function to deposit their BDO-BUSD LP tokens 
    function userDepositShare(uint256 _amount) external onlyOwner {
        require(tokenShare.balanceOf(address(msg.sender)) >= _amount);
        tokenShare.safeTransferFrom(msg.sender, address(this), _amount);
        contractStakeAllShare();
    }
    
    function userWithdrawShare() external onlyOwner {
        contractWithdrawAllShare();
        tokenShare.safeTransfer(msg.sender, tokenShare.balanceOf(address(this)));
    }
    
    
    function contractClaimDollar() internal onlyOwner {
        if(shareStaked > 0) {
            boardroomContract.claimReward();   
        }
    }


    /**
     * @dev Swaps {bdo} for {busd} and add liquidity to the BDO-BUSD Pool using PancakeSwap.
     */
    function harvest() external onlyOwner {
        contractClaimDollar();
        uint256 dollarSplit = tokenDollar.balanceOf(address(this)).div(2);
        
        IPancakeRouter(pancakeRouter).swapExactTokensForTokens(dollarSplit, 0, DollarToBUSDRoute, address(this), block.timestamp.add(600));

        uint256 dollarBal = tokenDollar.balanceOf(address(this));
        uint256 busdBal = tokenBUSD.balanceOf(address(this));
        
        IPancakeRouter(pancakeRouter).addLiquidity(address(tokenDollar), address(tokenBUSD), dollarBal, busdBal, 1, 1, address(this), block.timestamp.add(600));
        contractDepositAllLP();
        contractStakeAllShare();
    }
    
    function exitAvalanche() external onlyOwner {
        contractWithdrawLP(LpStaked);
        contractWithdrawAllShare();
        tokenLP.safeTransfer(msg.sender, tokenLP.balanceOf(address(this)));
        tokenShare.safeTransfer(msg.sender, tokenShare.balanceOf(address(this)));
    }
    
    function withdrawLP() external onlyOwner {
        tokenLP.safeTransfer(msg.sender, tokenLP.balanceOf(address(this)));
    }
    
    function withdrawShare() external onlyOwner {
        tokenShare.safeTransfer(msg.sender, tokenShare.balanceOf(address(this)));
    }
    
    function withdrawDollar() external onlyOwner {
        tokenDollar.safeTransfer(msg.sender, tokenDollar.balanceOf(address(this)));
    }
    
    function withdrawBUSD() external onlyOwner {
        tokenBUSD.safeTransfer(msg.sender, tokenBUSD.balanceOf(address(this)));
    }

    /**
     * @dev Pauses the strat.
     */
    function pause() public onlyOwner {
        _pause();

        tokenLP.safeApprove(shareRewardPoolAddr, 0);
        tokenShare.safeApprove(boardroomAddr, 0);
        tokenDollar.safeApprove(pancakeRouter, 0);
        tokenBUSD.safeApprove(pancakeRouter, 0);
    }

    /**
     * @dev Unpauses the strat.
     */
    function unpause() external onlyOwner {
        _unpause();
        tokenLP.safeApprove(shareRewardPoolAddr, MAX_INT);
        tokenShare.safeApprove(boardroomAddr, MAX_INT);
        tokenDollar.safeApprove(pancakeRouter, MAX_INT);
        tokenBUSD.safeApprove(pancakeRouter, MAX_INT);
    }
}    
