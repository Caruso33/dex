import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import {
  BigNumber,
  Contract,
  ContractFactory,
  ContractTransaction,
  Event,
} from "ethers";
import { ethers } from "hardhat";
import TestHelper from "./utils";

describe("Exchange contract", async function () {
  let contract: Contract;
  const feePercent = 10;

  const accounts = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const feeAccount: SignerWithAddress = accounts[1];

  const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async () => {
    const Contract = await ethers.getContractFactory("Exchange");

    contract = await Contract.deploy(await feeAccount.getAddress(), feePercent);
    contract = await contract.deployed();
  });

  describe("Exchange contract deployment", () => {
    it("sets correct owner", async () => {
      const result = await contract.owner();
      expect(result).to.equal(await owner.getAddress());
    });

    it("sets correct feeAccount", async () => {
      const result = await contract.feeAccount();
      expect(result).to.equal(await feeAccount.getAddress());
    });

    it("sets correct fee", async () => {
      const result = await contract.feePercent();
      expect(result).to.equal(feePercent);
    });
  });

  describe("Exchange contract", () => {
    let TokenContract: ContractFactory;
    let tokenContract: Contract;
    const tokenUser: SignerWithAddress = accounts[2];
    const etherAmount: BigNumber = ethers.utils.parseEther("1");
    const tokenAmount: BigNumber = ethers.utils.parseUnits("10", 18);

    let testHelper: TestHelper;

    beforeEach(async () => {
      TokenContract = await ethers.getContractFactory("Token");
      tokenContract = await TokenContract.deploy();
      tokenContract = await tokenContract.deployed();
      await tokenContract.transfer(tokenUser.address, tokenAmount);

      testHelper = new TestHelper(
        tokenUser,
        tokenContract,
        contract,
        ETHER_ADDRESS
      );
    });

    async function approveAndDepositToken() {
      const txApprove = await tokenContract
        .connect(tokenUser)
        .approve(contract.address, tokenAmount);

      const txDeposit = await contract
        .connect(tokenUser)
        .depositToken(tokenContract.address, tokenAmount);

      return { txApprove, txDeposit };
    }

    describe("ether", () => {
      describe("success", () => {
        it("can deposit ether", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: ethers.utils.parseEther("1") });
        });

        it("tracks the ether deposit", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: etherAmount });
          const result = await contract.balances(
            ETHER_ADDRESS,
            tokenUser.address
          );

          expect(result).to.equal(etherAmount);
        });

        it("emits a deposit event", async () => {
          const tx = await contract
            .connect(tokenUser)
            .depositEther({ value: ethers.utils.parseEther("1") });

          await expect(tx)
            .to.emit(contract, "DepositEvent")
            .withArgs(
              ETHER_ADDRESS,
              tokenUser.address,
              etherAmount,
              etherAmount,
              (
                await ethers.provider.getBlock(tx.blockNumber!)
              ).timestamp
            );
        });

        it("can withdraw ether", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: etherAmount });
          const result = await contract.balances(
            ETHER_ADDRESS,
            tokenUser.address
          );
          expect(result).to.equal(etherAmount);

          const etherBalanceBefore = await tokenUser.getBalance();
          let tx = await contract.connect(tokenUser).withdrawEther(etherAmount);
          tx = await tx.wait();

          const gasPrice =
            tx.effectiveGasPrice ||
            (await ethers.provider.getFeeData()).gasPrice;

          const etherBalanceAfter = await tokenUser.getBalance();

          const balanceDifference = etherBalanceAfter.sub(etherBalanceBefore);
          const gasConsumed = ethers.utils.parseUnits(
            (
              Number(tx.cumulativeGasUsed.toString()) *
              Number(gasPrice.toString())
            ).toString(),
            "wei"
          );

          assert.isAtLeast(
            Number(balanceDifference.toString()),
            Number(etherAmount.sub(gasConsumed).toString())
          );

          const result2 = await contract.balances(
            ETHER_ADDRESS,
            tokenUser.address
          );
          expect(result2).to.equal(ethers.constants.Zero);
        });

        it("emits a withdrawal event", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: etherAmount });
          const tx = await contract
            .connect(tokenUser)
            .withdrawEther(etherAmount);

          await expect(tx)
            .to.emit(contract, "WithdrawalEvent")
            .withArgs(
              ETHER_ADDRESS,
              tokenUser.address,
              etherAmount,
              0,
              (
                await ethers.provider.getBlock(tx.blockNumber)
              ).timestamp
            );
        });
      });

      describe("failure", () => {
        it("reverts if not enough ether is deposited", async () => {
          await expect(
            contract.connect(tokenUser).depositEther({ value: 0 })
          ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("reverts if not enough ether is withdrawn", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: etherAmount });
          await expect(
            contract.connect(tokenUser).withdrawEther(0)
          ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("reverts if too much ether is withdrawn", async () => {
          await contract
            .connect(tokenUser)
            .depositEther({ value: etherAmount });
          await expect(
            contract.connect(tokenUser).withdrawEther(etherAmount.add(1))
          ).to.be.revertedWith(
            "Amount must be less than or equal to ether balance"
          );
        });
      });
    });

    describe("token", () => {
      describe("success", () => {
        it("can deposit a token", async () => {
          await approveAndDepositToken();
        });

        it("tracks the token deposit", async () => {
          // token contract
          const tokenBalanceBefore = await tokenContract.balanceOf(
            contract.address
          );
          await approveAndDepositToken();
          const tokenBalanceAfter = await tokenContract.balanceOf(
            contract.address
          );

          expect(tokenBalanceAfter.sub(tokenBalanceBefore).toString()).to.equal(
            tokenAmount.toString()
          );

          // exchange contract
          const tokenBalanceUser = await contract.balances(
            tokenContract.address,
            tokenUser.address
          );
          expect(tokenBalanceUser.toString()).to.equal(tokenAmount.toString());

          const tokenBalanceOwner = await contract.balances(
            tokenContract.address,
            owner.getAddress()
          );
          expect(tokenBalanceOwner.toString()).to.equal("0");
        });

        it("emits a deposit event", async () => {
          const { txDeposit } = await approveAndDepositToken();
          const tx = await txDeposit.wait();

          // tx has now additional props
          const event: Event = tx.events.find(
            (e: Event) => e.event === "DepositEvent"
          );
          const block = await ethers.provider.getBlock(tx.blockNumber!);
          // listen events on transaction
          // eslint-disable-next-line
          expect(event).to.not.be.undefined;
          expect(event.args?.token).to.equal(tokenContract.address);
          expect(event.args?.user).to.equal(tokenUser.address);
          expect(event.args?.amount).to.equal(tokenAmount);
          expect(event.args?.balance).to.equal(tokenAmount);
          expect(event.args?.timestamp).to.equal(block.timestamp);

          // listen events on contract
          // 1st method
          await expect(txDeposit)
            .to.emit(contract, "DepositEvent")
            .withArgs(
              tokenContract.address,
              tokenUser.address,
              tokenAmount,
              tokenAmount,
              block.timestamp
            );

          // 2nd method
          contract.on(
            "DepositEvent",
            (from, to, amount, balance, timestamp) => {
              expect(from).to.equal(tokenContract.address);
              expect(to).to.equal(tokenUser.address);
              expect(amount.toString()).to.equal(tokenAmount.toString());
              expect(balance.toString()).to.equal(tokenAmount.toString());
              expect(timestamp).to.equal(block.timestamp);
            }
          );
        });

        it("can withdraw a token", async () => {
          const tokenBalanceBefore = await tokenContract.balanceOf(
            tokenUser.address
          );
          const contractBalanceBefore = await contract
            .connect(tokenUser)
            .balances(tokenContract.address, tokenUser.address);

          await approveAndDepositToken();

          await contract
            .connect(tokenUser)
            .withdrawToken(tokenContract.address, tokenAmount);

          const tokenBalanceAfter = await tokenContract.balanceOf(
            tokenUser.address
          );
          const contractBalanceAfter = await contract
            .connect(tokenUser)
            .balances(tokenContract.address, tokenUser.address);

          expect(tokenBalanceAfter).to.equal(tokenBalanceBefore);
          expect(tokenBalanceAfter).to.equal(tokenAmount);
          expect(contractBalanceAfter).to.equal(contractBalanceBefore);
          expect(contractBalanceAfter).to.equal(0);
        });

        it("emits a withdrawal event", async () => {
          await approveAndDepositToken();

          const tx = await contract
            .connect(tokenUser)
            .withdrawToken(tokenContract.address, tokenAmount);

          await expect(tx)
            .to.emit(contract, "WithdrawalEvent")
            .withArgs(
              tokenContract.address,
              tokenUser.address,
              tokenAmount,
              0,
              (
                await ethers.provider.getBlock(tx.blockNumber!)
              ).timestamp
            );
        });
      });

      describe("failure", () => {
        it("reverts when is not approved first", async () => {
          await expect(
            contract.depositToken(tokenContract.address, tokenAmount)
          ).to.be.reverted;

          await expect(
            contract.depositToken(tokenContract.address, tokenAmount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("reverts when the amount is zero", async () => {
          await tokenContract
            .connect(tokenUser)
            .approve(contract.address, tokenAmount);

          await expect(
            contract.depositToken(tokenContract.address, ethers.constants.Zero)
          ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("reverts when the amount is negative", async () => {
          await tokenContract
            .connect(tokenUser)
            .approve(contract.address, tokenAmount);

          await expect(
            contract.depositToken(
              tokenContract.address,
              ethers.utils.parseUnits("-1", 18)
            )
          ).to.be.reverted;
        });

        it("reverts ether deposits", async () => {
          await tokenContract
            .connect(tokenUser)
            .approve(contract.address, tokenAmount);

          await expect(
            contract.depositToken(tokenContract.address, tokenAmount, {
              value: ethers.utils.parseEther("1"),
            })
          ).to.be.reverted;

          await expect(contract.depositToken(0, tokenAmount)).to.be.reverted;
        });

        it("reverts when the token does not exist", async () => {
          await tokenContract
            .connect(tokenUser)
            .approve(contract.address, tokenAmount);

          const addressOne = "0x0000000000000000000000000000000000000001";

          await expect(contract.depositToken(addressOne, tokenAmount)).to.be
            .reverted;
        });

        it("reverts if not enough tokens are withdrawn", async () => {
          await approveAndDepositToken();

          await expect(
            contract.withdrawToken(tokenContract.address, 0)
          ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("reverts if ether is withdrawn", async () => {
          await approveAndDepositToken();

          await expect(
            contract.withdrawToken(ETHER_ADDRESS, tokenAmount)
          ).to.be.revertedWith(
            "No ether should withdrawn with this transaction"
          );
        });

        it("reverts if too many tokens are withdrawn", async () => {
          await approveAndDepositToken();

          await expect(
            contract.withdrawToken(tokenContract.address, tokenAmount.add(1))
          ).to.be.revertedWith(
            "Amount must be less than or equal to token balance"
          );
        });
      });
    });

    describe("balanceOf", () => {
      it("returns user ether balance", async () => {
        await contract.connect(tokenUser).depositEther({ value: etherAmount });
        const result = await contract.balanceOf(
          ETHER_ADDRESS,
          tokenUser.address
        );
        expect(result).to.equal(etherAmount);

        await approveAndDepositToken();
        const result2 = await contract.balanceOf(
          ETHER_ADDRESS,
          tokenUser.address
        );
        expect(result2).to.equal(etherAmount);
      });

      it("returns user token balance", async () => {
        await approveAndDepositToken();

        const result = await contract.balanceOf(
          tokenContract.address,
          tokenUser.address
        );
        expect(result).to.equal(tokenAmount);
      });
    });

    describe("orders", () => {
      let orderTx: ContractTransaction;
      const orderId = 1;
      const trader = accounts[3];

      beforeEach(async () => {
        await approveAndDepositToken();

        orderTx = await contract
          .connect(tokenUser)
          .makeOrder(
            tokenContract.address,
            tokenAmount,
            ETHER_ADDRESS,
            etherAmount
          );
      });

      describe("success", () => {
        it("creates and tracks the order", async () => {
          const order = await contract.orders(1);
          const [
            id,
            user,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            timestamp,
          ] = order;

          expect(id).to.equal(1);
          expect(user).to.equal(tokenUser.address);
          expect(tokenGet).to.equal(tokenContract.address);
          expect(amountGet).to.equal(tokenAmount);
          expect(tokenGive).to.equal(ETHER_ADDRESS);
          expect(amountGive).to.equal(etherAmount);

          const block = await ethers.provider.getBlock(orderTx.blockNumber!);
          expect(timestamp).to.equal(block.timestamp);
        });

        it("emit a make order event", async () => {
          await expect(orderTx)
            .to.emit(contract, "MakeOrderEvent")
            .withArgs(
              1,
              tokenUser.address,
              tokenContract.address,
              tokenAmount,
              ETHER_ADDRESS,
              etherAmount,
              (
                await ethers.provider.getBlock(orderTx.blockNumber!)
              ).timestamp
            );
        });

        it("cancels order event", async () => {
          await contract.connect(tokenUser).cancelOrder(orderId);

          const order = await contract.orders(orderId);
          const [id, user, , , , , , isCancelled] = order;

          expect(id).to.equal(orderId);
          expect(user).to.equal(tokenUser.address);
          expect(isCancelled).to.equal(true);
        });

        it("emits a cancel order event", async () => {
          const cancelTx = await contract.connect(tokenUser).cancelOrder(1);

          await expect(cancelTx)
            .to.emit(contract, "CancelOrderEvent")
            .withArgs(
              1,
              tokenUser.address,
              (
                await ethers.provider.getBlock(cancelTx.blockNumber)
              ).timestamp
            );
        });

        it("fills order and tracks balances", async () => {
          await contract.connect(trader).depositEther({ value: etherAmount });

          const [tokenUserBefore, tokenTraderBefore] =
            await testHelper.getExchangeTokenBalance([
              tokenUser.address,
              trader.address,
            ]);

          const [etherUserBefore, etherTraderBefore] =
            await testHelper.getExchangeEtherBalance([
              tokenUser.address,
              trader.address,
            ]);

          await contract.connect(trader).fillOrder(orderId);

          const [tokenUserAfter, tokenTraderAfter] =
            await testHelper.getExchangeTokenBalance([
              tokenUser.address,
              trader.address,
            ]);

          const [etherUserAfter, etherTraderAfter] =
            await testHelper.getExchangeEtherBalance([
              tokenUser.address,
              trader.address,
            ]);

          const feePercent = await contract.feePercent();
          const feeAmount = tokenAmount.mul(feePercent).div(100);

          const tokenDiffTraderWithFees = (
            tokenTraderAfter -
            tokenTraderBefore +
            Number(feeAmount.toString())
          ).toString();

          expect(tokenUserAfter - tokenUserBefore).to.equal(-tokenAmount);
          expect(tokenDiffTraderWithFees).to.equal(tokenAmount);

          expect((etherUserAfter - etherUserBefore).toString()).to.equal(
            etherAmount
          );
          expect(etherTraderAfter - etherTraderBefore).to.equal(-etherAmount);
        });

        it("emits a trade event", async () => {
          await contract.connect(trader).depositEther({ value: etherAmount });

          const tradeTx = await contract.connect(trader).fillOrder(orderId);
          const block = await ethers.provider.getBlock(tradeTx.blockNumber!);

          await expect(tradeTx)
            .to.emit(contract, "TradeEvent")
            .withArgs(
              orderId,
              trader.address,
              tokenUser.address,
              tokenContract.address,
              tokenAmount,
              ETHER_ADDRESS,
              etherAmount,
              block.timestamp
            );
        });
      });

      describe("failure", () => {
        it("reverts order canceling when the order isn't owned by sender", async () => {
          await expect(
            contract.connect(accounts[9]).cancelOrder(orderId)
          ).to.be.revertedWith("Only user can cancel order");
        });
      });
    });

    it("reverts if ether is sent to fallback", async () => {
      await expect(
        tokenUser.sendTransaction({
          to: contract.address,
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.reverted;
    });
  });
});
