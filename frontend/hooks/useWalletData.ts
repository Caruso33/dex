import { useCallback, useEffect, useRef } from "react"
import { useAccount, useNetwork } from "wagmi"
import useAppState from "../state"
import { actionTypes } from "../state/reducer"

function useWalletData() {
  const [state, dispatch] = useAppState()

  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const handleChainData = useCallback(
    (value: object) => {
      dispatch({ type: actionTypes.ADD_CHAIN, data: value })
    },
    [dispatch]
  )

  useEffect(() => {
    if (account?.address !== state.user?.account?.address) {
      if (!account?.address) {
        dispatch({ type: actionTypes.REMOVE_WALLET })
      }

      if (account?.address) {
        dispatch({ type: actionTypes.ADD_WALLET, data: account })
      }
    }
  }, [account, state, dispatch])

  const prevChain = useRef<undefined | number>()
  useEffect(() => {
    const activeChainId = activeChain?.id

    if (activeChainId !== prevChain.current) {
      prevChain.current = activeChainId

      if (!activeChainId) {
        dispatch({ type: actionTypes.REMOVE_CHAIN })
      }

      if (activeChainId) {
        dispatch({ type: actionTypes.REMOVE_CHAIN })
        handleChainData(activeChain)
      }
    }
  }, [activeChain, dispatch, handleChainData])
}

export default useWalletData
