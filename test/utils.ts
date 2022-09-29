import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

class TestHelper {
  user: SignerWithAddress;

  tokenContract: Contract;
  exchangeContract: Contract;

  ETHER_ADDRESS: string;

  constructor(
    user: SignerWithAddress,
    tokenContract: Contract,
    exchangeContract: Contract,
    ETHER_ADDRESS: string
  ) {
    this.user = user;

    this.tokenContract = tokenContract;
    this.exchangeContract = exchangeContract;

    this.ETHER_ADDRESS = ETHER_ADDRESS;
  }

  async getTokenBalance(accounts: string[]) {
    return Promise.all(
      Array.from({ length: accounts.length }, (_, i) =>
        this.tokenContract.balanceOf(this.tokenContract.address, accounts[i])
      )
    );
  }

  async getExchangeTokenBalance(accounts: string[]) {
    return Promise.all(
      Array.from({ length: accounts.length }, (_, i) =>
        this.exchangeContract.balanceOf(this.tokenContract.address, accounts[i])
      )
    );
  }

  async getExchangeEtherBalance(accounts: string[]) {
    return Promise.all(
      Array.from({ length: accounts.length }, (_, i) =>
        this.exchangeContract.balanceOf(this.ETHER_ADDRESS, accounts[i])
      )
    );
  }
}

export { TestHelper as default };
