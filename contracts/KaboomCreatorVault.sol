// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title KaboomCreatorVault
 * @notice Vesting vault for creator's 30% token allocation
 * @dev Supports lock periods: 0 (instant), 7 days, 30 days, 180 days, 365 days
 *      After lock period, tokens vest linearly over the same duration
 */
contract KaboomCreatorVault {
    using SafeERC20 for IERC20;

    /// @notice The Kaboom token this vault holds
    address public immutable token;

    /// @notice The token creator (beneficiary)
    address public immutable creator;

    /// @notice The factory that deployed this vault
    address public immutable factory;

    /// @notice Vault creation timestamp
    uint256 public immutable createdAt;

    /// @notice Lock duration in seconds
    uint256 public immutable lockDuration;

    /// @notice Vesting duration in seconds (same as lock)
    uint256 public immutable vestingDuration;

    /// @notice Total tokens allocated to vault
    uint256 public immutable totalAllocation;

    /// @notice Tokens already claimed
    uint256 public claimed;

    /// @notice Valid lock durations
    uint256 public constant DURATION_INSTANT = 0;
    uint256 public constant DURATION_7_DAYS = 7 days;
    uint256 public constant DURATION_30_DAYS = 30 days;
    uint256 public constant DURATION_180_DAYS = 180 days;
    uint256 public constant DURATION_365_DAYS = 365 days;

    /// @notice Emitted when tokens are claimed
    event TokensClaimed(address indexed creator, uint256 amount, uint256 totalClaimed);

    /// @notice Custom errors
    error Unauthorized();
    error NothingToClaim();
    error InvalidDuration();

    /**
     * @notice Deploy a new creator vault
     * @param token_ The Kaboom token address
     * @param creator_ The token creator address
     * @param lockDuration_ Lock period in seconds
     * @param allocation_ Total token allocation
     */
    constructor(
        address token_,
        address creator_,
        uint256 lockDuration_,
        uint256 allocation_
    ) {
        // Validate lock duration
        if (
            lockDuration_ != DURATION_INSTANT &&
            lockDuration_ != DURATION_7_DAYS &&
            lockDuration_ != DURATION_30_DAYS &&
            lockDuration_ != DURATION_180_DAYS &&
            lockDuration_ != DURATION_365_DAYS
        ) revert InvalidDuration();

        token = token_;
        creator = creator_;
        factory = msg.sender;
        createdAt = block.timestamp;
        lockDuration = lockDuration_;
        vestingDuration = lockDuration_; // Same as lock
        totalAllocation = allocation_;
    }

    /**
     * @notice Calculate vested amount available to claim
     * @return Amount of tokens available to claim
     */
    function vestedAmount() public view returns (uint256) {
        // If instant unlock, everything is available
        if (lockDuration == 0) {
            return totalAllocation;
        }

        uint256 elapsed = block.timestamp - createdAt;

        // Still in lock period
        if (elapsed < lockDuration) {
            return 0;
        }

        // Calculate vesting progress
        uint256 vestingElapsed = elapsed - lockDuration;

        // Fully vested
        if (vestingElapsed >= vestingDuration) {
            return totalAllocation;
        }

        // Linear vesting
        return (totalAllocation * vestingElapsed) / vestingDuration;
    }

    /**
     * @notice Get claimable amount (vested minus already claimed)
     * @return Amount available to claim now
     */
    function claimable() public view returns (uint256) {
        return vestedAmount() - claimed;
    }

    /**
     * @notice Claim vested tokens
     */
    function claim() external {
        if (msg.sender != creator) revert Unauthorized();

        uint256 amount = claimable();
        if (amount == 0) revert NothingToClaim();

        claimed += amount;
        IERC20(token).safeTransfer(creator, amount);

        emit TokensClaimed(creator, amount, claimed);
    }

    /**
     * @notice Get vault status
     * @return isLocked Whether still in lock period
     * @return lockEndsAt Timestamp when lock ends
     * @return vestingEndsAt Timestamp when fully vested
     * @return percentVested Current vesting percentage (0-100)
     */
    function getStatus() external view returns (
        bool isLocked,
        uint256 lockEndsAt,
        uint256 vestingEndsAt,
        uint256 percentVested
    ) {
        lockEndsAt = createdAt + lockDuration;
        vestingEndsAt = lockEndsAt + vestingDuration;
        isLocked = block.timestamp < lockEndsAt;
        percentVested = (vestedAmount() * 100) / totalAllocation;
    }
}
