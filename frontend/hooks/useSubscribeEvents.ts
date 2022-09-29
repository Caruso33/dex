import { useEffect } from "react"
import useAppState from "../state"
import {
  subscribeCancelOrderEvents,
  subscribeMakeOrderEvents,
} from "./subscribeEvents"

function useSubscribeEvents() {
  const [state, dispatch] = useAppState()

  useEffect(() => {
    subscribeMakeOrderEvents(state?.contracts?.exchangeContract, dispatch)

    subscribeCancelOrderEvents(state?.contracts?.exchangeContract, dispatch)
  }, [state?.contracts?.exchangeContract, dispatch])
}

export default useSubscribeEvents
