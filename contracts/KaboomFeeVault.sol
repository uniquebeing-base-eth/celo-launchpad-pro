// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IOwnerAdmins.sol";

/**
 * @title KaboomFeeVault
 * @notice Fee collection and distribution vault in wCELO
 * @dev Platform fee (0.4%) + Creator fee (1-3%) collected on trades
 */
contract KaboomFeeVault is IOwnerAdmins {
    using SafeERC20 for IERC20;

    /// @notice wCELO token address on Celo
    address public immutable wCELO;

    /// @notice Factory address
    address public immutable factory;

    /// @notice Platform wallet for fee claims
    address public platformWallet;

    /// @notice Platform fee in basis points (40 = 0.4%)
    uint256 public constant PLATFORM_FEE_BPS = 40;

    /// @notice Maximum creator fee in basis points (300 = 3%)
    uint256 public constant MAX_CREATOR_FEE_BPS = 300;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Admin mapping
    mapping(address => bool) public isAdmin;

    /// @notice Pending platform fees
    uint256 public pendingPlatformFees;

    /// @notice Pending creator fees per token
    mapping(address => uint256) public pendingCreatorFees;

    /// @notice Creator fee per token in basis points
    mapping(address => uint256) public tokenCreatorFee;

    /// @notice Token creator mapping
    mapping(address => address) public tokenCreator;

    /// @notice Emitted when fees are collected
    event FeesCollected(
        address indexed token,
        uint256 tradeAmount,
        uint256 platformFee,
        uint256 creatorFee
    );

    /// @notice Emitted when platform fees are claimed
    event PlatformFeesClaimed(address indexed to, uint256 amount);

    /// @notice Emitted when creator fees are claimed
    event CreatorFeesClaimed(address indexed token, address indexed to, uint256 amount);

    /// @notice Custom errors
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();
    error InvalidCreatorFee();

    /**
     * @notice Deploy the fee vault
     * @param wCELO_ wCELO token address
     * @param platformWallet_ Initial platform wallet
     * @param factory_ Factory address
     */
    constructor(address wCELO_, address platformWallet_, address factory_) {
        if (wCELO_ == address(0) || platformWallet_ == address(0)) revert ZeroAddress();
        
        wCELO = wCELO_;
        platformWallet = platformWallet_;
        factory = factory_;
        isAdmin[msg.sender] = true;
    }

    /// @notice Modifier to restrict to admins
    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert Unauthorized();
        _;
    }

    /// @notice Modifier to restrict to factory
    modifier onlyFactory() {
        if (msg.sender != factory) revert Unauthorized();
        _;
    }

    /**
     * @notice Register a new token with its creator fee
     * @param token Token address
     * @param creator Creator address
     * @param creatorFeeBps Creator fee in basis points
     */
    function registerToken(
        address token,
        address creator,
        uint256 creatorFeeBps
    ) external onlyFactory {
        if (creatorFeeBps > MAX_CREATOR_FEE_BPS) revert InvalidCreatorFee();
        
        tokenCreator[token] = creator;
        tokenCreatorFee[token] = creatorFeeBps;
    }

    /**
     * @notice Collect fees from a trade
     * @param token Token being traded
     * @param amount Total wCELO trade amount
     */
    function collectFees(address token, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorFee = (amount * tokenCreatorFee[token]) / BPS_DENOMINATOR;
        uint256 totalFee = platformFee + creatorFee;

        // Transfer fees from caller (router)
        IERC20(wCELO).safeTransferFrom(msg.sender, address(this), totalFee);

        pendingPlatformFees += platformFee;
        pendingCreatorFees[token] += creatorFee;

        emit FeesCollected(token, amount, platformFee, creatorFee);
    }

    /**
     * @notice Claim accumulated platform fees
     * @param to Recipient address
     */
    function claimPlatformFees(address to) external onlyAdmin {
        if (to == address(0)) revert ZeroAddress();
        
        uint256 amount = pendingPlatformFees;
        if (amount == 0) revert InsufficientBalance();

        pendingPlatformFees = 0;
        IERC20(wCELO).safeTransfer(to, amount);

        emit PlatformFeesClaimed(to, amount);
    }

    /**
     * @notice Claim accumulated creator fees for a token
     * @param token Token address
     * @param to Recipient address
     */
    function claimCreatorFees(address token, address to) external {
        // Only token creator can claim their fees
        if (msg.sender != tokenCreator[token]) revert Unauthorized();
        if (to == address(0)) revert ZeroAddress();

        uint256 amount = pendingCreatorFees[token];
        if (amount == 0) revert InsufficientBalance();

        pendingCreatorFees[token] = 0;
        IERC20(wCELO).safeTransfer(to, amount);

        emit CreatorFeesClaimed(token, to, amount);
    }

    /**
     * @notice Set admin status
     * @param admin Address to update
     * @param enabled Whether to grant or revoke
     */
    function setAdmin(address admin, bool enabled) external onlyAdmin {
        if (admin == address(0)) revert ZeroAddress();
        isAdmin[admin] = enabled;
        emit SetAdmin(admin, enabled);
    }

    /**
     * @notice Update platform wallet
     * @param newWallet New platform wallet
     */
    function setPlatformWallet(address newWallet) external onlyAdmin {
        if (newWallet == address(0)) revert ZeroAddress();
        platformWallet = newWallet;
    }
}
