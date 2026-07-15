// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOwnerAdmins
 * @notice Interface for owner/admin management
 */
interface IOwnerAdmins {
    /// @notice Emitted when admin status is changed
    event SetAdmin(address indexed admin, bool enabled);

    /// @notice Thrown when caller is not authorized
    error Unauthorized();

    /**
     * @notice Set admin status for an address
     * @param admin Address to update
     * @param isAdmin Whether to grant or revoke admin
     */
    function setAdmin(address admin, bool isAdmin) external;
}
