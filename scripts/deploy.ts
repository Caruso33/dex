// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers } from "hardhat";

// DEPRECATED
// use yarn deploy to use hardhat deploy plugin

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TokenContract = await ethers.getContractFactory("Token");
  const tokenContract = await TokenContract.deploy();

  await tokenContract.deployed();

  console.log("Token Contract deployed to:", tokenContract.address);

  const accounts = await hre.ethers.getSigners();

  const feeAccount = accounts[0];
  const feePercent = 10;

  const ExchangeContract = await ethers.getContractFactory("Exchange");
  const exchangeContract = await ExchangeContract.deploy(
    feeAccount.address,
    feePercent
  );

  await exchangeContract.deployed();

  console.log("Exchange Contract deployed to:", exchangeContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
