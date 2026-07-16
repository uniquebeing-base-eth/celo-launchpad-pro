// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract KaboomPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable token;
    address public immutable usdc;
    address public immutable factory;

    uint256 public reserveToken;
    uint256 public reserveUsdc;
    uint256 public totalShares;

    mapping(address => uint256) public shares;

    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 usdcAmount, uint256 sharesMinted);
    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 usdcAmount, uint256 sharesBurned);
    event Swap(address indexed trader, bool isBuy, uint256 inputAmount, uint256 outputAmount);

    error ZeroAmount();
    error InsufficientLiquidity();
    error SlippageExceeded();
    error Unauthorized();

    constructor(address token_, address usdc_, address factory_) {
        if (token_ == address(0) || usdc_ == address(0) || factory_ == address(0)) revert ZeroAmount();
        token = token_;
        usdc = usdc_;
        factory = factory_;
    }

    function addLiquidity(uint256 tokenAmount, uint256 usdcAmount) external nonReentrant returns (uint256 sharesMinted) {
        if (tokenAmount == 0 || usdcAmount == 0) revert ZeroAmount();

        if (totalShares == 0) {
            sharesMinted = 1000 * 10**18;
        } else {
            uint256 tokenShare = (tokenAmount * totalShares) / reserveToken;
            uint256 usdcShare = (usdcAmount * totalShares) / reserveUsdc;
            sharesMinted = tokenShare < usdcShare ? tokenShare : usdcShare;
        }

        IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), usdcAmount);

        reserveToken += tokenAmount;
        reserveUsdc += usdcAmount;
        shares[msg.sender] += sharesMinted;
        totalShares += sharesMinted;

        emit LiquidityAdded(msg.sender, tokenAmount, usdcAmount, sharesMinted);
        return sharesMinted;
    }

    function removeLiquidity(uint256 shareAmount) external nonReentrant returns (uint256 tokenOut, uint256 usdcOut) {
        if (shareAmount == 0) revert ZeroAmount();
        if (shares[msg.sender] < shareAmount) revert Unauthorized();

        uint256 tokenOutAmount = (reserveToken * shareAmount) / totalShares;
        uint256 usdcOutAmount = (reserveUsdc * shareAmount) / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;

        reserveToken -= tokenOutAmount;
        reserveUsdc -= usdcOutAmount;

        IERC20(token).safeTransfer(msg.sender, tokenOutAmount);
        IERC20(usdc).safeTransfer(msg.sender, usdcOutAmount);

        emit LiquidityRemoved(msg.sender, tokenOutAmount, usdcOutAmount, shareAmount);
        return (tokenOutAmount, usdcOutAmount);
    }

    function buyToken(uint256 usdcAmount, uint256 minTokensOut) external nonReentrant returns (uint256 tokensOut) {
        if (usdcAmount == 0) revert ZeroAmount();
        if (reserveUsdc == 0 || reserveToken == 0) revert InsufficientLiquidity();

        uint256 feeAdjusted = (usdcAmount * 997) / 1000;
        tokensOut = (reserveToken * feeAdjusted) / (reserveUsdc + feeAdjusted);
        if (tokensOut < minTokensOut) revert SlippageExceeded();

        IERC20(usdc).safeTransferFrom(msg.sender, address(this), usdcAmount);
        IERC20(token).safeTransfer(msg.sender, tokensOut);

        reserveUsdc += usdcAmount;
        reserveToken -= tokensOut;

        emit Swap(msg.sender, true, usdcAmount, tokensOut);
        return tokensOut;
    }

    function sellToken(uint256 tokenAmount, uint256 minUsdcOut) external nonReentrant returns (uint256 usdcOut) {
        if (tokenAmount == 0) revert ZeroAmount();
        if (reserveUsdc == 0 || reserveToken == 0) revert InsufficientLiquidity();

        uint256 feeAdjusted = (tokenAmount * 997) / 1000;
        usdcOut = (reserveUsdc * feeAdjusted) / (reserveToken + feeAdjusted);
        if (usdcOut < minUsdcOut) revert SlippageExceeded();

        IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);
        IERC20(usdc).safeTransfer(msg.sender, usdcOut);

        reserveToken += tokenAmount;
        reserveUsdc -= usdcOut;

        emit Swap(msg.sender, false, tokenAmount, usdcOut);
        return usdcOut;
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveToken, reserveUsdc);
    }
}
