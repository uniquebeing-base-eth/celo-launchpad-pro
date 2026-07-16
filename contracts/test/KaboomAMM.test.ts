import { expect } from "chai";
import { ethers } from "hardhat";

describe("Kaboom AMM trading", function () {
  it("launches a token with a trading pool and enables swaps", async function () {
    const [deployer, creator] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const wCELO = await MockERC20.deploy("Wrapped CELO", "wCELO", 18);
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);

    await usdc.mint(creator.address, ethers.parseUnits("100000", 6));

    const KaboomFeeVault = await ethers.getContractFactory("KaboomFeeVault");
    const feeVault = await KaboomFeeVault.deploy(
      await wCELO.getAddress(),
      deployer.address,
      deployer.address
    );

    const KaboomFactory = await ethers.getContractFactory("KaboomFactory");
    const factory = await KaboomFactory.deploy(
      await wCELO.getAddress(),
      await feeVault.getAddress(),
      deployer.address,
      await usdc.getAddress()
    );

    await feeVault.setFactory(await factory.getAddress());

    const KaboomRouter = await ethers.getContractFactory("KaboomRouter");
    const router = await KaboomRouter.deploy(
      await factory.getAddress(),
      await feeVault.getAddress(),
      await wCELO.getAddress(),
      await usdc.getAddress()
    );

    await usdc.connect(creator).approve(await factory.getAddress(), ethers.parseUnits("1000", 6));

    const tx = await factory.connect(creator).launchToken(
      "Test Token",
      "TEST",
      100,
      0,
      "",
      "",
      "",
      ""
    );

    await tx.wait();

    const tokens = await factory.getAllTokens();
    const token = tokens[0];
    const pool = await factory.getPoolForToken(token);

    expect(pool).to.not.equal(ethers.ZeroAddress);

    const [reserveToken, reserveUsdc] = await router.getPoolReserves(token);
    expect(reserveToken).to.be.gt(0n);
    expect(reserveUsdc).to.be.gt(0n);

    const quote = await router.getBuyQuote(token, ethers.parseUnits("100", 6));
    expect(quote.amountOut).to.be.gt(0n);

    const balanceBefore = await ethers.provider.getBalance(creator.address);
    await usdc.connect(creator).approve(await router.getAddress(), ethers.parseUnits("100", 6));
    await router.connect(creator).buy(token, ethers.parseUnits("100", 6), 1n);

    const tokenContract = await ethers.getContractAt("KaboomToken", token);
    const creatorTokenBalance = await tokenContract.balanceOf(creator.address);
    expect(creatorTokenBalance).to.be.gt(0n);
    expect(balanceBefore).to.not.equal(await ethers.provider.getBalance(creator.address));
  });
});
