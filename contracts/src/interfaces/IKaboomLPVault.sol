// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IKaboomLPVault
 * @notice Interface for the permanent LP lock vault
 */
interface IKaboomLPVault {
    /// @notice Emitted when LP tokens are locked
    event LPLocked(address indexed token, address indexed pool, uint256 amount);

    /// @notice Custom errors
    error Unauthorized();
    error AlreadyInitialized();
    error ZeroAmount();

    /**
     * @notice Get the token this vault is for
     * @return Token address
     */
    function token() external view returns (address);

    /**
     * @notice Get the LP pool address
     * @return Pool address
     */
    function pool() external view returns (address);

    /**
     * @notice Get the factory address
     * @return Factory address
     */
    function factory() external view returns (address);

    /**
     * @notice Get locked LP token balance
     * @return Amount of LP tokens locked
     */
    function lockedBalance() external view returns (uint256);

    /**
     * @notice Check if LP is permanently locked (always true after init)
     * @return True if locked
     */
    function isLocked() external view returns (bool);
}
