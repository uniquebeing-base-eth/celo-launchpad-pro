// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title KaboomLPVault
 * @notice Permanent LP lock vault - LP tokens can NEVER be withdrawn
 * @dev This ensures rug-proof liquidity for all Kaboom tokens
 */
contract KaboomLPVault {
    using SafeERC20 for IERC20;

    /// @notice The Kaboom token this vault is for
    address public immutable token;

    /// @notice The LP pool address
    address public immutable pool;

    /// @notice The factory that deployed this vault
    address public immutable factory;

    /// @notice Whether the vault has been initialized with LP
    bool public isLocked;

    /// @notice Amount of LP tokens locked
    uint256 public lockedBalance;

    /// @notice Emitted when LP tokens are locked
    event LPLocked(address indexed token, address indexed pool, uint256 amount);

    /// @notice Custom errors
    error Unauthorized();
    error AlreadyInitialized();
    error ZeroAmount();

    /**
     * @notice Deploy a new LP vault
     * @param token_ The Kaboom token address
     * @param pool_ The LP pool address
     * @param factory_ The factory address
     */
    constructor(address token_, address pool_, address factory_) {
        token = token_;
        pool = pool_;
        factory = factory_;
    }

    /**
     * @notice Lock LP tokens permanently
     * @dev Can only be called once by the factory
     * @param amount Amount of LP tokens to lock
     */
    function lockLP(uint256 amount) external {
        if (msg.sender != factory) revert Unauthorized();
        if (isLocked) revert AlreadyInitialized();
        if (amount == 0) revert ZeroAmount();

        isLocked = true;
        lockedBalance = amount;

        // Transfer LP tokens to this vault (they stay here forever)
        IERC20(pool).safeTransferFrom(msg.sender, address(this), amount);

        emit LPLocked(token, pool, amount);
    }

    /**
     * @notice Get the current LP balance (should equal lockedBalance)
     * @return Current LP token balance
     */
    function getLPBalance() external view returns (uint256) {
        return IERC20(pool).balanceOf(address(this));
    }

    // No withdraw functions - LP is permanently locked
}
