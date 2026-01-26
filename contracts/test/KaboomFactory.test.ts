import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("KaboomFactory", function () {
  async function deployFixture() {
    const [owner, creator, user1, user2] = await ethers.getSigners();

    // Deploy mock wCELO
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const wCELO = await MockERC20.deploy("Wrapped CELO", "wCELO", 18);

    // Deploy FeeVault
    const KaboomFeeVault = await ethers.getContractFactory("KaboomFeeVault");
    const feeVault = await KaboomFeeVault.deploy(
      await wCELO.getAddress(),
      owner.address,
      owner.address
    );

    // Deploy Factory
    const KaboomFactory = await ethers.getContractFactory("KaboomFactory");
    const factory = await KaboomFactory.deploy(
      await wCELO.getAddress(),
      await feeVault.getAddress(),
      owner.address
    );

    // Deploy Router
    const KaboomRouter = await ethers.getContractFactory("KaboomRouter");
    const router = await KaboomRouter.deploy(
      await factory.getAddress(),
      await feeVault.getAddress(),
      await wCELO.getAddress()
    );

    return { owner, creator, user1, user2, wCELO, feeVault, factory, router };
  }

  describe("Token Launch", function () {
    it("Should launch a token with correct supply", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      const tx = await factory.connect(creator).launchToken(
        "Test Token",
        "TEST",
        100, // 1% creator fee
        0,   // Instant unlock
        "",  // No twitter
        "",  // No telegram
        "",  // No website
        ""   // No farcaster
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "TokenLaunched"
      );
      
      expect(event).to.not.be.undefined;

      // Verify token is registered
      const tokens = await factory.getTokensByCreator(creator.address);
      expect(tokens.length).to.equal(1);

      const isKaboom = await factory.isKaboomToken(tokens[0]);
      expect(isKaboom).to.be.true;
    });

    it("Should create LP and Creator vaults", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      await factory.connect(creator).launchToken(
        "Vault Test",
        "VAULT",
        200, // 2% creator fee
        7 * 24 * 60 * 60, // 7 days lock
        "https://twitter.com/test",
        "",
        "",
        ""
      );

      const tokens = await factory.getAllTokens();
      const tokenInfo = await factory.getTokenInfo(tokens[0]);

      expect(tokenInfo.creator).to.equal(creator.address);
      expect(tokenInfo.lpVault).to.not.equal(ethers.ZeroAddress);
      expect(tokenInfo.creatorFee).to.equal(200);
    });

    it("Should reject invalid creator fee", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      await expect(
        factory.connect(creator).launchToken(
          "Bad Fee",
          "BAD",
          400, // 4% - exceeds max
          0,
          "",
          "",
          "",
          ""
        )
      ).to.be.revertedWithCustomError(factory, "CreatorFeeExceedsMax");
    });

    it("Should store social links", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      await factory.connect(creator).launchToken(
        "Social Token",
        "SOCIAL",
        100,
        0,
        "https://twitter.com/kaboom",
        "https://t.me/kaboom",
        "https://kaboom.fun",
        "kaboom.eth"
      );

      const tokens = await factory.getAllTokens();
      const socials = await factory.getTokenSocials(tokens[0]);

      expect(socials.twitterLink).to.equal("https://twitter.com/kaboom");
      expect(socials.telegramLink).to.equal("https://t.me/kaboom");
      expect(socials.websiteLink).to.equal("https://kaboom.fun");
      expect(socials.farcasterLink).to.equal("kaboom.eth");
    });
  });

  describe("Token Supply", function () {
    it("Should mint 50B total supply", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      await factory.connect(creator).launchToken(
        "Supply Test",
        "SUPPLY",
        100,
        0,
        "",
        "",
        "",
        ""
      );

      const tokens = await factory.getAllTokens();
      const KaboomToken = await ethers.getContractFactory("KaboomToken");
      const token = KaboomToken.attach(tokens[0]);

      const totalSupply = await token.totalSupply();
      const expectedSupply = ethers.parseEther("50000000000"); // 50B

      expect(totalSupply).to.equal(expectedSupply);
    });

    it("Should allocate 70% to LP vault and 30% to creator vault", async function () {
      const { factory, creator } = await loadFixture(deployFixture);

      await factory.connect(creator).launchToken(
        "Allocation Test",
        "ALLOC",
        100,
        0,
        "",
        "",
        "",
        ""
      );

      const tokens = await factory.getAllTokens();
      const tokenInfo = await factory.getTokenInfo(tokens[0]);

      const KaboomToken = await ethers.getContractFactory("KaboomToken");
      const token = KaboomToken.attach(tokens[0]);

      const lpBalance = await token.balanceOf(tokenInfo.lpVault);
      const creatorVaultBalance = await token.balanceOf(tokenInfo[2]); // creatorVault

      const totalSupply = ethers.parseEther("50000000000");
      const expectedLP = (totalSupply * 70n) / 100n;
      const expectedCreator = (totalSupply * 30n) / 100n;

      expect(lpBalance).to.equal(expectedLP);
      expect(creatorVaultBalance).to.equal(expectedCreator);
    });
  });
});

// Mock ERC20 for testing
// contracts/test/mocks/MockERC20.sol should be created
