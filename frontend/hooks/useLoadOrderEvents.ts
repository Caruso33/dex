import { useEffect } from "react"
import useAppState from "../state"
import {
  loadCancelOrderEvents,
  loadMakeOrderEvents,
  loadTradeEvents,
} from "./loadEvents"

function useLoadMakeOrderEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    const exchangeContract = state.contracts?.exchangeContract
    if (exchangeContract && state?.events?.makeOrders?.length === 0) {
      loadMakeOrderEvents(exchangeContract, dispatch)
    }
  }, [
    state.contracts?.exchangeContract,
    state?.events?.makeOrders?.length,
    dispatch,
  ])
}

function useLoadCancelOrderEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    const exchangeContract = state.contracts?.exchangeContract
    if (exchangeContract && state?.events?.cancelOrders?.length === 0) {
      loadCancelOrderEvents(exchangeContract, dispatch)
    }
  }, [
    state.contracts?.exchangeContract,
    state?.events?.cancelOrders?.length,
    dispatch,
  ])
}

function useLoadTradeOrderEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    const exchangeContract = state.contracts?.exchangeContract

    if (exchangeContract && state?.events?.trades?.length === 0) {
      loadTradeEvents(exchangeContract, dispatch)
    }
  }, [
    state.contracts?.exchangeContract,
    state?.events?.trades?.length,
    dispatch,
  ])
}

export {
  useLoadMakeOrderEvents,
  useLoadCancelOrderEvents,
  useLoadTradeOrderEvents,
}
