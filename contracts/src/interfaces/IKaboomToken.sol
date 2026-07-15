// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IKaboomToken
 * @notice Interface for Kaboom ERC-20 tokens
 */
interface IKaboomToken is IERC20 {
    /// @notice Get the token creator address
    function creator() external view returns (address);

    /// @notice Get the factory that deployed this token
    function factory() external view returns (address);

    /// @notice Get launch timestamp
    function launchTime() external view returns (uint256);
}
