// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IKaboomFeeVault
 * @notice Interface for fee collection and distribution
 */
interface IKaboomFeeVault {
    /// @notice Emitted when fees are collected
    event FeesCollected(address indexed token, uint256 platformFee, uint256 creatorFee);

    /// @notice Emitted when platform fees are claimed
    event PlatformFeesClaimed(address indexed to, uint256 amount);

    /// @notice Emitted when creator fees are claimed
    event CreatorFeesClaimed(address indexed token, address indexed to, uint256 amount);

    /// @notice Emitted when admin status is changed
    event SetAdmin(address indexed admin, bool enabled);

    /// @notice Custom errors
    error Unauthorized();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();

    /**
     * @notice Collect fees from a trade
     * @param token Token being traded
     * @param amount Total wCELO amount
     */
    function collectFees(address token, uint256 amount) external;

    /**
     * @notice Claim accumulated platform fees
     * @param to Recipient address
     */
    function claimPlatformFees(address to) external;

    /**
     * @notice Claim accumulated creator fees for a token
     * @param token Token address
     * @param to Recipient address
     */
    function claimCreatorFees(address token, address to) external;

    /**
     * @notice Set admin status for an address
     * @param admin Address to update
     * @param isAdmin Whether to grant or revoke admin
     */
    function setAdmin(address admin, bool isAdmin) external;

    /**
     * @notice Check if address is admin
     * @param account Address to check
     * @return True if admin
     */
    function isAdmin(address account) external view returns (bool);

    /**
     * @notice Get pending platform fees
     * @return Amount of unclaimed platform fees
     */
    function pendingPlatformFees() external view returns (uint256);

    /**
     * @notice Get pending creator fees for a token
     * @param token Token address
     * @return Amount of unclaimed creator fees
     */
    function pendingCreatorFees(address token) external view returns (uint256);
}
