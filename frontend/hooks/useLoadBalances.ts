import { BigNumber, ethers } from "ethers"
import { useCallback, useEffect } from "react"
import { useProvider, useSigner } from "wagmi"
import useAppState from "../state"
import { actionTypes } from "../state/reducer"

function useLoadBalances() {
  const [state, dispatch] = useAppState()
  const provider = useProvider()
  const { data: signer } = useSigner()

  const loadBalances = useCallback(async () => {
    const { tokenContract, exchangeContract } = state.contracts
    const account = state.user.account

    if (!tokenContract || !exchangeContract || !account) {
      return
    }

    let etherBalance: BigNumber
    let tokenBalance: BigNumber
    let exchangeEtherBalance: BigNumber
    let exchangeTokenBalance: BigNumber

    try {
      if (provider) {
        etherBalance = await provider.getBalance(account?.address)
      }

      if (signer) {
        exchangeEtherBalance = await exchangeContract.balanceOf(
          ethers.constants.AddressZero,
          account?.address
        )

        exchangeTokenBalance = await exchangeContract.balanceOf(
          tokenContract.address,
          account?.address
        )

        tokenBalance = await tokenContract
          .connect(signer)
          .balanceOf(account?.address)
      }

      dispatch({
        type: actionTypes.ADD_BALANCES,
        data: {
          ether: etherBalance!,
          token: tokenBalance!,
          exchangeEther: exchangeEtherBalance!,
          exchangeToken: exchangeTokenBalance!,
        },
      })
    } catch (e) {
      console.error("Error: ", e)
    }
  }, [provider, signer, state.contracts, state.user.account, dispatch])

  useEffect(() => {
    loadBalances()
  }, [loadBalances])
}

export default useLoadBalances
