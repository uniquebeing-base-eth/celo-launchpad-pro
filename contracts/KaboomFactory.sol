// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./KaboomToken.sol";
import "./KaboomLPVault.sol";
import "./KaboomCreatorVault.sol";
import "./KaboomFeeVault.sol";
import "./interfaces/IKaboomFactory.sol";

/**
 * @title KaboomFactory
 * @notice Main factory for launching Kaboom tokens on Celo
 * @dev Deploys token + LP vault + creator vault, registers with fee vault
 */
contract KaboomFactory is IKaboomFactory {
    using SafeERC20 for IERC20;

    /// @notice wCELO token address
    address public immutable wCELO;

    /// @notice Fee vault address
    address public immutable feeVault;

    /// @notice Platform wallet
    address public platformWallet;

    /// @notice Virtual starting price: $0.0000005 (in 18 decimals)
    uint256 public constant VIRTUAL_PRICE = 5 * 10**11; // 0.0000005 * 10^18

    /// @notice Virtual market cap: $25,000 (in 18 decimals)
    uint256 public constant VIRTUAL_MARKET_CAP = 25_000 * 10**18;

    /// @notice Mapping of creator to their tokens
    mapping(address => address[]) public creatorTokens;

    /// @notice Check if address is a Kaboom token
    mapping(address => bool) public isKaboomToken;

    /// @notice All launched tokens
    address[] public allTokens;

    /// @notice Token metadata
    struct TokenInfo {
        address creator;
        address lpVault;
        address creatorVault;
        uint256 virtualPrice;
        uint256 virtualMarketCap;
        uint256 creatorFee;
        uint256 launchTime;
        string twitterLink;
        string telegramLink;
        string websiteLink;
        string farcasterLink;
    }

    /// @notice Token info mapping
    mapping(address => TokenInfo) public tokenInfo;

    /// @notice Emitted on token launch
    event TokenLaunched(
        address indexed token,
        address indexed creator,
        address lpVault,
        address creatorVault,
        uint256 totalSupply,
        uint256 virtualPrice,
        uint256 virtualMarketCap,
        uint256 timestamp
    );

    /// @notice Emitted when social links are set
    event TokenMetadataSet(
        address indexed token,
        string twitterLink,
        string telegramLink,
        string websiteLink,
        string farcasterLink
    );

    /**
     * @notice Deploy the factory
     * @param wCELO_ wCELO token address
     * @param feeVault_ Fee vault address
     * @param platformWallet_ Platform wallet for fees
     */
    constructor(address wCELO_, address feeVault_, address platformWallet_) {
        if (wCELO_ == address(0)) revert ZeroAddress();
        if (feeVault_ == address(0)) revert ZeroAddress();
        if (platformWallet_ == address(0)) revert ZeroAddress();

        wCELO = wCELO_;
        feeVault = feeVault_;
        platformWallet = platformWallet_;
    }

    /**
     * @notice Launch a new Kaboom token
     * @param name Token name
     * @param symbol Token symbol
     * @param creatorFee Creator fee in basis points (100 = 1%, max 300)
     * @param vaultDuration Vesting duration (0, 7d, 30d, 180d, 365d)
     * @param twitterLink Optional Twitter link
     * @param telegramLink Optional Telegram link
     * @param websiteLink Optional website link
     * @param farcasterLink Optional Farcaster link
     * @return token Deployed token address
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
    ) external returns (address token) {
        // Validations
        if (bytes(name).length == 0) revert InvalidName();
        if (bytes(symbol).length == 0) revert InvalidSymbol();
        if (creatorFee > 300) revert CreatorFeeExceedsMax();

        address creator = msg.sender;

        // Deploy creator vault first (will receive 30%)
        KaboomCreatorVault creatorVault = new KaboomCreatorVault(
            address(0), // Token address set after creation
            creator,
            vaultDuration,
            (50_000_000_000 * 10**18 * 30) / 100 // 30% of 50B
        );

        // Deploy LP vault (will receive 70%)
        // Pool address will be set when first trade occurs
        KaboomLPVault lpVault = new KaboomLPVault(
            address(0), // Token address set after creation
            address(0), // Pool address set on first trade
            address(this)
        );

        // Deploy token - mints 70% to LP vault, 30% to creator vault
        KaboomToken kaboomToken = new KaboomToken(
            name,
            symbol,
            creator,
            address(lpVault),
            address(creatorVault)
        );

        token = address(kaboomToken);

        // Register token with fee vault
        KaboomFeeVault(feeVault).registerToken(token, creator, creatorFee);

        // Store token info
        tokenInfo[token] = TokenInfo({
            creator: creator,
            lpVault: address(lpVault),
            creatorVault: address(creatorVault),
            virtualPrice: VIRTUAL_PRICE,
            virtualMarketCap: VIRTUAL_MARKET_CAP,
            creatorFee: creatorFee,
            launchTime: block.timestamp,
            twitterLink: twitterLink,
            telegramLink: telegramLink,
            websiteLink: websiteLink,
            farcasterLink: farcasterLink
        });

        // Register mappings
        isKaboomToken[token] = true;
        creatorTokens[creator].push(token);
        allTokens.push(token);

        emit TokenLaunched(
            token,
            creator,
            address(lpVault),
            address(creatorVault),
            50_000_000_000 * 10**18,
            VIRTUAL_PRICE,
            VIRTUAL_MARKET_CAP,
            block.timestamp
        );

        if (bytes(twitterLink).length > 0 || bytes(telegramLink).length > 0 || 
            bytes(websiteLink).length > 0 || bytes(farcasterLink).length > 0) {
            emit TokenMetadataSet(token, twitterLink, telegramLink, websiteLink, farcasterLink);
        }

        return token;
    }

    /**
     * @notice Get all tokens by a creator
     */
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @notice Get all launched tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @notice Get token count
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @notice Get full token info
     */
    function getTokenInfo(address token) external view returns (
        address creator,
        address lpVault,
        address feeVaultAddr,
        uint256 virtualPrice,
        uint256 virtualMarketCap,
        uint256 creatorFee,
        uint256 launchTime
    ) {
        TokenInfo memory info = tokenInfo[token];
        return (
            info.creator,
            info.lpVault,
            feeVault,
            info.virtualPrice,
            info.virtualMarketCap,
            info.creatorFee,
            info.launchTime
        );
    }

    /**
     * @notice Get token social links
     */
    function getTokenSocials(address token) external view returns (
        string memory twitterLink,
        string memory telegramLink,
        string memory websiteLink,
        string memory farcasterLink
    ) {
        TokenInfo memory info = tokenInfo[token];
        return (
            info.twitterLink,
            info.telegramLink,
            info.websiteLink,
            info.farcasterLink
        );
    }
}
