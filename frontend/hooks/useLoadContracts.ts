import { useCallback, useEffect, useRef } from "react"
import { useProvider } from "wagmi"
import getContracts from "../components/index/getContracts"
import useAppState from "../state"
import { contractTypes } from "../state/reducers/contracts"

function useLoadContracts() {
  const [state, dispatch] = useAppState()
  const provider = useProvider()

  const chainId = state.user?.chain?.id

  const loadContracts = useCallback(async () => {
    const contracts = await getContracts(chainId, provider)

    if (contracts)
      dispatch({ type: contractTypes.CHANGE_CONTRACTS, data: contracts })
  }, [chainId, dispatch, provider])

  const prevChain = useRef(chainId)
  useEffect(() => {
    if (chainId !== prevChain.current) {
      prevChain.current = chainId

      dispatch({ type: contractTypes.REMOVE_CONTRACTS })

      if (chainId) {
        loadContracts()
      }
    }
  }, [chainId, dispatch, loadContracts])
}

export default useLoadContracts
