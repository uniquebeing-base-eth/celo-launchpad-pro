// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title KaboomToken
 * @notice Standard ERC-20 token with fixed supply, no owner privileges
 * @dev Supply is minted once at creation. No mint/burn after deployment.
 */
contract KaboomToken is ERC20 {
    /// @notice Token creator address
    address public immutable creator;

    /// @notice Factory that deployed this token
    address public immutable factory;

    /// @notice Launch timestamp
    uint256 public immutable launchTime;

    /// @notice Total supply: 50 billion tokens (with 18 decimals)
    uint256 public constant TOTAL_SUPPLY = 50_000_000_000 * 10**18;

    /// @notice LP allocation: 70% of total supply
    uint256 public constant LP_ALLOCATION = (TOTAL_SUPPLY * 70) / 100;

    /// @notice Creator/vault allocation: 30% of total supply
    uint256 public constant CREATOR_ALLOCATION = (TOTAL_SUPPLY * 30) / 100;

    /**
     * @notice Deploy a new Kaboom token
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param creator_ Token creator address
     * @param lpVault_ LP vault address (receives 70%)
     * @param creatorVault_ Creator vault address (receives 30%)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address creator_,
        address lpVault_,
        address creatorVault_
    ) ERC20(name_, symbol_) {
        creator = creator_;
        factory = msg.sender;
        launchTime = block.timestamp;

        // Mint fixed supply - 70% to LP vault, 30% to creator vault
        _mint(lpVault_, LP_ALLOCATION);
        _mint(creatorVault_, CREATOR_ALLOCATION);
    }
}
