import {
  Box,
  Button,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text
} from "@chakra-ui/react"
import { BigNumber, ethers } from "ethers"
import React, { useState } from "react"
import { useSigner } from "wagmi"
import useAppState from "../../state"
import { actionTypes } from "../../state/reducer"

const NewOrder: React.FC = () => {
  const [state, dispatch] = useAppState()

  const [order, setOrder] = useState({ amount: 0, price: 0 })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tabIndex, setTabIndex] = useState<number>(0)

  const handleTabsChange = (index: number) => setTabIndex(index)

  const { data: signer } = useSigner()

  const makeOrder = async () => {
    setIsLoading(true)

    const exchangeContract = state.contracts?.exchangeContract

    try {
      let tokenGet: string
      let tokenGive: string
      let amountGet: BigNumber
      let amountGive: BigNumber

      if (tabIndex === 0) {
        tokenGet = ethers.constants.AddressZero
        amountGet = ethers.utils.parseEther(
          (order.amount * order.price).toString()
        )
        tokenGive = state.contracts?.tokenContract?.address
        amountGive = ethers.utils.parseUnits(order.amount.toString())
      } else {
        tokenGet = state.contracts?.tokenContract?.address
        amountGet = ethers.utils.parseUnits(order.amount.toString())
        tokenGive = ethers.constants.AddressZero
        amountGive = ethers.utils.parseEther(
          (order.amount * order.price).toString()
        )
      }

      console.dir(amountGet.toString(), amountGive.toString())
      console.dir(
        ethers.utils.formatEther(amountGet.toString()),
        ethers.utils.formatUnits(amountGive.toString())
      )

      const tx = await exchangeContract
        .connect(signer)
        .makeOrder(tokenGet, amountGet, tokenGive, amountGive)
      await tx.wait()
      dispatch({ type: actionTypes.UPDATE_EVENTS })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex flexDirection="column" p="1rem" height="inherit" width="inherit">
      <Box>
        <Text fontSize="xl" style={{ fontWeight: "bold" }}>
          New Order
        </Text>
      </Box>

      <Tabs
        isFitted
        index={tabIndex}
        onChange={handleTabsChange}
        fontSize="sm"
        mt="1rem"
      >
        <TabList>
          <Tab>Buy</Tab>
          <Tab>Sell</Tab>
        </TabList>
      </Tabs>

      <Box fontSize="sm" mt="1rem">
        {tabIndex === 0 ? "Buy Amount" : "Sell Amount"}
      </Box>
      <NumberInput
        placeholder={tabIndex === 0 ? "Buy Amount" : "Sell Amount"}
        value={order.amount}
        onChange={(value: string) =>
          setOrder({ ...order, amount: Number(value) })
        }
        defaultValue={0.0}
        min={0.0}
        step={0.001}
        mt="0.5rem"
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Box fontSize="sm" mt="1rem">
        {tabIndex === 0 ? "Buy Price" : "Sell Price"}
      </Box>
      <NumberInput
        placeholder={tabIndex === 0 ? "Buy Price" : "Sell Price"}
        value={order.price}
        onChange={(value: string) =>
          setOrder({ ...order, price: Number(value) })
        }
        defaultValue={0.0}
        min={0.0}
        step={0.001}
        mt="0.5rem"
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Button
        mt="1rem"
        bg="blue.500"
        onClick={() => makeOrder()}
        isDisabled={isLoading}
      >
        {isLoading ? <Spinner /> : "Make Order"}
      </Button>
    </Flex>
  )
}

export default NewOrder
