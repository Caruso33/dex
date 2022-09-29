import { Listener } from "@ethersproject/providers"
import { BigNumber, Contract, utils } from "ethers"
import { Dispatch } from "react"
import { actionTypes } from "../state/reducer"
import { CancelOrderEvent } from "../types"

function subscribeEvents(
  contract: Contract,
  eventName: string | Record<string, any>,
  listener: Listener
) {
  console.log(
    `Subscribing to ${
      typeof eventName === "string" ? eventName : eventName?.topics?.join(", ")
    } events`
  )
  contract.on(eventName, listener)
}

function subscribeMakeOrderEvents(contract: Contract, dispatch: Dispatch<any>) {
  if (!contract) return

  const listener: Listener = (
    id: BigNumber,
    user: string,
    timestamp: BigNumber
  ) => {
    dispatch({
      type: actionTypes.ADD_CANCEL_ORDER,
      data: { id, user, timestamp } as CancelOrderEvent,
    })
  }

  subscribeEvents(
    contract,
    // "MakeOrderEvent",
    {
      topics: [
        utils.id(
          "MakeOrderEvent(uint256,address,address,uint256,address,uint256,uint256)"
        ),
      ],
      fromBlock: "latest",
    },
    listener
  )
}

function subscribeCancelOrderEvents(
  contract: Contract,
  dispatch: Dispatch<any>
) {
  if (!contract) return

  const listener: Listener = (
    id: BigNumber,
    user: string,
    timestamp: BigNumber
  ) => {
    dispatch({
      type: actionTypes.ADD_CANCEL_ORDER,
      data: { id, user, timestamp } as CancelOrderEvent,
    })
  }

  subscribeEvents(
    contract,
    // "CancelOrderEvent",
    {
      topics: [utils.id("CancelOrderEvent(uint256,address,uint256)")],
      fromBlock: "latest",
    },
    listener
  )
}

export { subscribeMakeOrderEvents, subscribeCancelOrderEvents }
