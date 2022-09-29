import { Contract, Event } from "ethers"
import { Result } from "ethers/lib/utils"
import { eventTypes } from "../state/reducers/events"
import {
  CancelOrderEvent,
  DepositEvent,
  MakeOrderEvent,
  TradeEvent,
  WithdrawalEvent,
} from "../types"

async function loadEvents(exchangeContract: Contract, eventName: string) {
  if (!exchangeContract) return

  const eventFilter = exchangeContract.filters[eventName]()
  const fromBlock = "earliest"
  const toBlock = "latest"

  const events = await exchangeContract.queryFilter(
    eventFilter,
    fromBlock,
    toBlock
  )

  console.log(`Got ${events?.length} ${eventName}s`)

  return events.map((event: Event) => event.args) as Array<Result>
}

async function loadMakeOrderEvents(exchangeContract: Contract, dispatch: any) {
  console.log("HERE loadMakeOrderEvents")

  const events = await loadEvents(exchangeContract, "MakeOrderEvent")

  const makeOrderEvents = events
    ?.filter((event: Result) => !!event)
    .map((event: Result) => {
      return {
        id: event.id,
        user: event.user,
        tokenGet: event.tokenGet,
        amountGet: event.amountGet,
        tokenGive: event.tokenGive,
        amountGive: event.amountGive,
        timestamp: event.timestamp,
      } as MakeOrderEvent
    })

  dispatch({ type: eventTypes.ADD_MAKE_ORDERS, data: makeOrderEvents })
}

async function loadCancelOrderEvents(
  exchangeContract: Contract,
  dispatch: any
) {
  const events = await loadEvents(exchangeContract, "CancelOrderEvent")

  const cancelEvents = events
    ?.filter((event: Result) => !!event)
    .map((event: Result) => {
      return {
        id: event.id,
        user: event.user,
        timestamp: event.timestamp,
      } as CancelOrderEvent
    })

  dispatch({ type: eventTypes.ADD_CANCEL_ORDERS, data: cancelEvents })
}

async function loadTradeEvents(exchangeContract: Contract, dispatch: any) {
  const events = await loadEvents(exchangeContract, "TradeEvent")

  const tradeEvents = events
    ?.filter((event: Result) => !!event)
    .map((event: Result) => {
      return {
        amountGet: event.amountGet,
        amountGive: event.amountGive,
        id: event.id,
        orderUser: event.orderUser,
        timestamp: event.timestamp,
        tokenGet: event.tokenGet,
        tokenGive: event.tokenGive,
        trader: event.trader,
      } as TradeEvent
    })

  dispatch({ type: eventTypes.ADD_TRADES, data: tradeEvents })
}

async function loadDepositEvents(exchangeContract: Contract, dispatch: any) {
  const events = await loadEvents(exchangeContract, "DepositEvent")

  const depositEvents = events
    ?.filter((event: Result) => !!event)
    .map((event: Result) => {
      return {
        token: event.token,
        user: event.user,
        amount: event.amount,
        balance: event.balance,
        timestamp: event.timestamp,
      } as DepositEvent
    })

  dispatch({ type: eventTypes.ADD_DEPOSITS, data: depositEvents })
}

async function loadWithdrawalEvents(exchangeContract: Contract, dispatch: any) {
  const events = await loadEvents(exchangeContract, "WithdrawalEvent")

  const withdrawalEvents = events
    ?.filter((event: Result) => !!event)
    .map((event: Result) => {
      return {
        token: event.token,
        user: event.user,
        amount: event.amount,
        balance: event.balance,
        timestamp: event.timestamp,
      } as WithdrawalEvent
    })

  dispatch({ type: eventTypes.ADD_WITHDRAWALS, data: withdrawalEvents })
}

export {
  loadEvents,
  loadMakeOrderEvents,
  loadCancelOrderEvents,
  loadTradeEvents,
  loadDepositEvents,
  loadWithdrawalEvents,
}
