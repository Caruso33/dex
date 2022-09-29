import { useEffect } from "react"
import useAppState from "../state"
import { loadDepositEvents, loadWithdrawalEvents } from "./loadEvents"

function useLoadDepositEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    const exchangeContract = state.contracts?.exchangeContract

    if (exchangeContract && state?.events?.deposits?.length === 0) {
      loadDepositEvents(exchangeContract, dispatch)
    }
  }, [
    state.contracts?.exchangeContract,
    state?.events?.deposits?.length,
    dispatch,
  ])
}

function useLoadWithdrawalEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    const exchangeContract = state.contracts?.exchangeContract

    if (exchangeContract && state?.events?.withdrawals?.length === 0) {
      loadWithdrawalEvents(exchangeContract, dispatch)
    }
  }, [
    state.contracts?.exchangeContract,
    state?.events?.withdrawals?.length,
    dispatch,
  ])
}

export { useLoadDepositEvents, useLoadWithdrawalEvents }
