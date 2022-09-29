import { BigNumber } from "ethers"

type DepositEvent = {
  token: string
  user: string
  amount: BigNumber
  balance: BigNumber
  timestamp: BigNumber
}

type WithdrawalEvent = {
  token: string
  user: string
  amount: BigNumber
  balance: BigNumber
  timestamp: BigNumber
}

type MakeOrderEvent = {
  id: BigNumber
  user: string
  tokenGet: BigNumber
  amountGet: BigNumber
  tokenGive: BigNumber
  amountGive: BigNumber
  timestamp: BigNumber
}

type CancelOrderEvent = {
  id: BigNumber
  user: string
  timestamp: BigNumber
}

type TradeEvent = {
  amountGet: BigNumber
  amountGive: BigNumber
  id: BigNumber
  orderUser: string
  timestamp: BigNumber
  tokenGet: string
  tokenGive: string
  trader: string
}

export type {
  DepositEvent,
  WithdrawalEvent,
  MakeOrderEvent,
  CancelOrderEvent,
  TradeEvent,
}
