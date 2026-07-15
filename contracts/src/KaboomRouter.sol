// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IKaboomFactory.sol";
import "./KaboomFeeVault.sol";

/**
 * @title KaboomRouter
 * @notice Router for buying/selling Kaboom tokens with automatic fee collection
 * @dev Handles trades and emits events for chart indexing
 */
contract KaboomRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Factory address
    address public immutable factory;

    /// @notice Fee vault address
    address public immutable feeVault;

    /// @notice wCELO address
    address public immutable wCELO;

    /// @notice AMM pool interface (simplified - integrate with Ubeswap/Curve)
    /// In production, this would integrate with actual DEX

    /// @notice Emitted on every trade (for chart indexing)
    event Trade(
        address indexed token,
        address indexed trader,
        bool isBuy,
        uint256 amountIn,
        uint256 amountOut,
        uint256 price,
        uint256 timestamp
    );

    /// @notice Emitted when pool is initialized on first buy
    event PoolInitialized(
        address indexed token,
        address indexed pool,
        uint256 initialLiquidity,
        uint256 timestamp
    );

    /// @notice Custom errors
    error InvalidToken();
    error InsufficientOutput();
    error ZeroAmount();
    error SlippageExceeded();

    /**
     * @notice Deploy the router
     * @param factory_ Factory address
     * @param feeVault_ Fee vault address
     * @param wCELO_ wCELO address
     */
    constructor(address factory_, address feeVault_, address wCELO_) {
        factory = factory_;
        feeVault = feeVault_;
        wCELO = wCELO_;
    }

    /**
     * @notice Buy Kaboom tokens with wCELO
     * @param token Token to buy
     * @param amountIn Amount of wCELO to spend
     * @param minAmountOut Minimum tokens to receive
     * @return amountOut Actual tokens received
     */
    function buy(
        address token,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (!IKaboomFactory(factory).isKaboomToken(token)) revert InvalidToken();
        if (amountIn == 0) revert ZeroAmount();

        // Transfer wCELO from user
        IERC20(wCELO).safeTransferFrom(msg.sender, address(this), amountIn);

        // Collect fees (platform + creator)
        IERC20(wCELO).approve(feeVault, amountIn);
        KaboomFeeVault(feeVault).collectFees(token, amountIn);

        // Calculate amount after fees
        uint256 platformFee = (amountIn * 40) / 10000; // 0.4%
        (,,,,,uint256 creatorFeeBps,) = IKaboomFactory(factory).getTokenInfo(token);
        uint256 creatorFee = (amountIn * creatorFeeBps) / 10000;
        uint256 amountAfterFees = amountIn - platformFee - creatorFee;

        // Execute swap on AMM (simplified - integrate with actual DEX)
        // In production: call Ubeswap/Curve router
        amountOut = _executeSwap(token, amountAfterFees, true);

        if (amountOut < minAmountOut) revert SlippageExceeded();

        // Transfer tokens to buyer
        IERC20(token).safeTransfer(msg.sender, amountOut);

        // Get current price for event
        uint256 price = _getCurrentPrice(token);

        emit Trade(token, msg.sender, true, amountIn, amountOut, price, block.timestamp);

        return amountOut;
    }

    /**
     * @notice Sell Kaboom tokens for wCELO
     * @param token Token to sell
     * @param amountIn Amount of tokens to sell
     * @param minAmountOut Minimum wCELO to receive
     * @return amountOut Actual wCELO received
     */
    function sell(
        address token,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (!IKaboomFactory(factory).isKaboomToken(token)) revert InvalidToken();
        if (amountIn == 0) revert ZeroAmount();

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amountIn);

        // Execute swap on AMM
        uint256 grossAmountOut = _executeSwap(token, amountIn, false);

        // Collect fees from output
        IERC20(wCELO).approve(feeVault, grossAmountOut);
        KaboomFeeVault(feeVault).collectFees(token, grossAmountOut);

        // Calculate amount after fees
        uint256 platformFee = (grossAmountOut * 40) / 10000;
        (,,,,,uint256 creatorFeeBps,) = IKaboomFactory(factory).getTokenInfo(token);
        uint256 creatorFee = (grossAmountOut * creatorFeeBps) / 10000;
        amountOut = grossAmountOut - platformFee - creatorFee;

        if (amountOut < minAmountOut) revert SlippageExceeded();

        // Transfer wCELO to seller
        IERC20(wCELO).safeTransfer(msg.sender, amountOut);

        // Get current price for event
        uint256 price = _getCurrentPrice(token);

        emit Trade(token, msg.sender, false, amountIn, amountOut, price, block.timestamp);

        return amountOut;
    }

    /**
     * @notice Get quote for buying tokens
     * @param token Token to buy
     * @param amountIn wCELO amount
     * @return amountOut Expected token amount
     * @return priceImpact Price impact in basis points
     */
    function getBuyQuote(
        address token,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact) {
        // Calculate fees
        uint256 platformFee = (amountIn * 40) / 10000;
        (,,,,,uint256 creatorFeeBps,) = IKaboomFactory(factory).getTokenInfo(token);
        uint256 creatorFee = (amountIn * creatorFeeBps) / 10000;
        uint256 amountAfterFees = amountIn - platformFee - creatorFee;

        // Get quote from AMM (simplified)
        amountOut = _getSwapQuote(token, amountAfterFees, true);
        priceImpact = _calculatePriceImpact(token, amountIn, true);

        return (amountOut, priceImpact);
    }

    /**
     * @notice Get quote for selling tokens
     * @param token Token to sell
     * @param amountIn Token amount
     * @return amountOut Expected wCELO amount
     * @return priceImpact Price impact in basis points
     */
    function getSellQuote(
        address token,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact) {
        // Get gross output from AMM
        uint256 grossAmountOut = _getSwapQuote(token, amountIn, false);

        // Calculate fees
        uint256 platformFee = (grossAmountOut * 40) / 10000;
        (,,,,,uint256 creatorFeeBps,) = IKaboomFactory(factory).getTokenInfo(token);
        uint256 creatorFee = (grossAmountOut * creatorFeeBps) / 10000;
        amountOut = grossAmountOut - platformFee - creatorFee;

        priceImpact = _calculatePriceImpact(token, amountIn, false);

        return (amountOut, priceImpact);
    }

    // ============ Internal Functions ============

    /**
     * @dev Execute swap on AMM - PLACEHOLDER
     * In production, integrate with Ubeswap/Curve
     */
    function _executeSwap(
        address token,
        uint256 amountIn,
        bool isBuy
    ) internal returns (uint256) {
        // TODO: Integrate with actual DEX
        // This is a placeholder - returns simplified calculation
        if (isBuy) {
            // wCELO -> Token
            return amountIn * 1000; // Simplified
        } else {
            // Token -> wCELO
            return amountIn / 1000; // Simplified
        }
    }

    /**
     * @dev Get swap quote from AMM - PLACEHOLDER
     */
    function _getSwapQuote(
        address token,
        uint256 amountIn,
        bool isBuy
    ) internal view returns (uint256) {
        // TODO: Get actual quote from DEX
        if (isBuy) {
            return amountIn * 1000;
        } else {
            return amountIn / 1000;
        }
    }

    /**
     * @dev Get current token price - PLACEHOLDER
     */
    function _getCurrentPrice(address token) internal view returns (uint256) {
        // TODO: Get price from DEX pool
        // Return virtual price as fallback
        (,,,uint256 virtualPrice,,,) = IKaboomFactory(factory).getTokenInfo(token);
        return virtualPrice;
    }

    /**
     * @dev Calculate price impact - PLACEHOLDER
     */
    function _calculatePriceImpact(
        address token,
        uint256 amountIn,
        bool isBuy
    ) internal view returns (uint256) {
        // TODO: Calculate actual price impact from pool reserves
        // Simplified: larger trades = more impact
        return (amountIn / 10**18) * 10; // 0.1% per 1 wCELO
    }
}
