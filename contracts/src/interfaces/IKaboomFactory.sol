// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IKaboomFactory
 * @notice Interface for the Kaboom token factory
 */
interface IKaboomFactory {
    /// @notice Emitted when a new token is launched
    event TokenLaunched(
        address indexed token,
        address indexed creator,
        address lpVault,
        address feeVault,
        uint256 totalSupply,
        uint256 virtualPrice,
        uint256 virtualMarketCap,
        uint256 timestamp
    );

    /// @notice Emitted when platform fee is updated
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    /// @notice Emitted when platform wallet is updated
    event PlatformWalletUpdated(address oldWallet, address newWallet);

    /// @notice Custom errors
    error InvalidCreator();
    error InvalidName();
    error InvalidSymbol();
    error InvalidVaultDuration();
    error CreatorFeeExceedsMax();
    error ZeroAddress();

    /**
     * @notice Launch a new Kaboom token
     * @param name Token name
     * @param symbol Token symbol
     * @param creatorFee Creator fee in basis points (100 = 1%, max 300 = 3%)
     * @param vaultDuration Vesting duration in seconds (0, 7 days, 30 days, 180 days, 365 days)
     * @param twitterLink Optional Twitter/X link
     * @param telegramLink Optional Telegram link
     * @param websiteLink Optional website link
     * @param farcasterLink Optional Farcaster link
     * @return token Address of the deployed token
     */
    function launchToken(
        string memory name,
        string memory symbol,
        uint256 creatorFee,
        uint256 vaultDuration,
        string memory twitterLink,
        string memory telegramLink,
        string memory websiteLink,
        string memory farcasterLink
    ) external returns (address token);

    /**
     * @notice Get all tokens created by a specific creator
     * @param creator Creator address
     * @return Array of token addresses
     */
    function getTokensByCreator(address creator) external view returns (address[] memory);

    /**
     * @notice Get all launched tokens
     * @return Array of all token addresses
     */
    function getAllTokens() external view returns (address[] memory);

    /**
     * @notice Check if an address is a Kaboom token
     * @param token Token address to check
     * @return True if token was launched via Kaboom
     */
    function isKaboomToken(address token) external view returns (bool);

    /**
     * @notice Get token metadata
     * @param token Token address
     * @return creator Token creator
     * @return lpVault LP vault address
     * @return feeVault Fee vault address
     * @return virtualPrice Virtual starting price
     * @return virtualMarketCap Virtual market cap
     * @return creatorFee Creator fee in basis points
     * @return launchTime Launch timestamp
     */
    function getTokenInfo(address token) external view returns (
        address creator,
        address lpVault,
        address feeVault,
        uint256 virtualPrice,
        uint256 virtualMarketCap,
        uint256 creatorFee,
        uint256 launchTime
    );

    function getPoolForToken(address token) external view returns (address pool);
}
