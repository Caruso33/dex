import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

let contract: Contract;

describe("Token Contract", async function () {
  const name = "Caruso 33 Token";
  const symbol = "C33T";
  const decimals = 18;
  const totalSupply = "1" + "0".repeat(6) + "0".repeat(decimals);

  beforeEach(async function () {
    const Contract = await ethers.getContractFactory("Token");

    contract = await Contract.deploy();
    await contract.deployed();
  });

  // it.skip("Should return the new greeting once it's changed", async function () {
  //   expect(await contract.greet()).to.equal("Hello, world!");

  //   console.log(await contract.greet());
  // const setGreetingTx = await contract.setGreeting("Hola, mundo!");

  // // wait until the transaction is mined
  // await setGreetingTx.wait();

  // expect(await contract.greet()).to.equal("Hola, mundo!");
  // });

  it("tracks the name", async () => {
    const result = await contract.name();
    expect(result).to.equal(name);
  });

  it("tracks the symbol", async () => {
    const result = await contract.symbol();
    expect(result).to.equal(symbol);
  });

  it("tracks the decimals", async () => {
    const result = await contract.decimals();
    expect(result).to.equal(decimals);
  });

  it("tracks the total supply", async () => {
    const result = await contract.totalSupply();
    expect(result.toString()).to.equal(totalSupply);
  });
});
