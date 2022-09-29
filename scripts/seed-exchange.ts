import { Event } from "ethers";
import {
  // HardhatEthersHelpers,
  HardhatRuntimeEnvironment,
} from "hardhat/types";

async function seedExchange(taskArgs: any, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  try {
    console.log("Running exchange seed...");

    // accounts
    const accounts = await ethers.getSigners();

    const sender = accounts[0];
    const receiver = accounts[1];

    const Token = hre.artifacts.readArtifactSync("Token");
    const Exchange = hre.artifacts.readArtifactSync("Exchange");

    const { token: tokenAddress, exchange: exchangeAddress } = taskArgs;

    const token = await new ethers.Contract(tokenAddress, Token.abi, sender);
    const exchange = await new ethers.Contract(
      exchangeAddress,
      Exchange.abi,
      sender
    );

    const amount = ethers.utils.parseUnits("100", 18);

    await token.connect(sender).transfer(receiver.address, amount);

    console.log(
      `Transferred ${amount} token from ${sender.address} to ${receiver.address}`
    );

    const user1 = accounts[0];
    const user2 = accounts[1];

    const ETHER_ADDRESS = ethers.constants.AddressZero;

    // initial deposits
    const initEtherAmount = 1000;
    const initTokenAmount = 1_000;

    const etherAmount = initEtherAmount / 100;
    const tokenAmount = initTokenAmount / 100;

    await token.connect(user1).approve(exchangeAddress, initTokenAmount);
    console.log(`Approved ${initTokenAmount} Tokens from ${user1.address}`);

    await exchange.connect(user1).depositToken(tokenAddress, initTokenAmount);
    console.log(`Deposited ${initTokenAmount} Tokens from ${user1.address}`);

    await exchange.connect(user2).depositEther({ value: initEtherAmount });
    console.log(`Deposited ${initEtherAmount} Ether from ${user1.address}`);

    // orders

    // 1 cancelled order
    let tx = await exchange
      .connect(user1)
      .makeOrder(tokenAddress, tokenAmount, ETHER_ADDRESS, etherAmount);
    console.log(`Made order from ${user1.address}`);

    tx = await tx.wait();
    let event = tx.events.find((e: Event) => e.event === "MakeOrderEvent");

    let orderId = event.args.id;
    tx = await exchange.connect(user1).cancelOrder(orderId);
    tx = await tx.wait();
    console.log(`Cancelled order ${orderId} from ${user1.address}`);

    await advanceOneMinute(ethers);

    // filled orders

    // 1st filled order
    tx = await exchange
      .connect(user1)
      .makeOrder(tokenAddress, tokenAmount, ETHER_ADDRESS, etherAmount);
    console.log(`Made order from ${user1.address}`);
    tx = await tx.wait();
    event = tx.events.find((e: Event) => e.event === "MakeOrderEvent");

    orderId = event.args.id;
    tx = await exchange.connect(user2).fillOrder(orderId);
    console.log(`Filled order ${orderId} from ${user2.address}`);

    await advanceOneMinute(ethers);

    // 2nd filled order
    tx = await exchange
      .connect(user1)
      .makeOrder(tokenAddress, tokenAmount / 2, ETHER_ADDRESS, etherAmount);
    console.log(`Made order from ${user1.address}`);
    tx = await tx.wait();
    event = tx.events.find((e: Event) => e.event === "MakeOrderEvent");

    orderId = event.args.id;
    tx = await exchange.connect(user2).fillOrder(orderId);
    console.log(`Filled order ${orderId} from ${user2.address}`);

    await advanceOneMinute(ethers);

    // open orders

    // 10 orders from user1
    for (let i = 0; i < 10; i++) {
      const ethAmount = ethers.utils.parseEther(
        (etherAmount * Math.ceil(Math.random() * i)).toString()
      );
      const tokAmount = ethers.utils.parseUnits(
        (tokenAmount * Math.ceil(Math.random() * i)).toString()
      );

      await exchange
        .connect(user1)
        .makeOrder(tokenAddress, tokAmount, ETHER_ADDRESS, ethAmount);
      console.log(`Made order from ${user1.address}`);

      await advanceOneMinute(ethers);
    }

    // 20 orders from user2
    for (let i = 0; i < 20; i++) {
      const ethAmount = ethers.utils.parseEther(
        (etherAmount * Math.ceil(Math.random() * i)).toString()
      );
      const tokAmount = ethers.utils.parseEther(
        (tokenAmount * Math.ceil(Math.random() * i)).toString()
      );

      await exchange
        .connect(user2)
        .makeOrder(ETHER_ADDRESS, ethAmount, tokenAddress, tokAmount);
      console.log(`Made order from ${user2.address}`);

      await advanceOneMinute(ethers);
    }
  } catch (error) {
    console.error("Seed failed: ", error);
  }
}

export default seedExchange;

async function advanceOneMinute(ethers: any) {
  await ethers.provider.send("evm_increaseTime", [60]);
  return await ethers.provider.send("evm_mine", []);
}
