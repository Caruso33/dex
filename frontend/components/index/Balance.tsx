import {
  Box,
  Button,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Tab,
  Table,
  TableContainer,
  TabList,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { ethers } from "ethers"
import React, { useState } from "react"
import { useSigner } from "wagmi"
import useLoadBalances from "../../hooks/useLoadBalances"
import useAppState from "../../state"
import { actionTypes } from "../../state/reducer"

const Balance: React.FC = () => {
  const [state, dispatch] = useAppState()

  const [deposit, setDeposit] = useState({ ethAmount: 0.0, tokenAmount: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const [tabIndex, setTabIndex] = useState<number>(0)

  const handleTabsChange = (index: number) => setTabIndex(index)

  const { data: signer } = useSigner()

  const { ether, token, exchangeEther, exchangeToken } = state?.user?.balances

  useLoadBalances()

  const depositEth = async () => {
    setIsLoading(true)

    const exchange = state.contracts?.exchangeContract

    try {
      const tx = await exchange.connect(signer).depositEther({
        value: ethers.utils.parseEther(deposit.ethAmount?.toString()),
      })
      await tx.wait()

      dispatch({ type: actionTypes.UPDATE_BALANCES })
      setDeposit({ ...deposit, ethAmount: 0.0 })
    } finally {
      setIsLoading(false)
    }
  }
  const depositToken = async () => {
    setIsLoading(true)

    const tokenContract = state.contracts?.tokenContract
    const exchangeContract = state.contracts?.exchangeContract

    try {
      await tokenContract
        .connect(signer)
        .approve(
          exchangeContract.address,
          ethers.utils.parseUnits(deposit.tokenAmount.toString())
        )
      const tx = await exchangeContract
        .connect(signer)
        .depositToken(
          state.contracts?.tokenContract?.address,
          ethers.utils.parseUnits(deposit.tokenAmount.toString())
        )
      await tx.wait()

      dispatch({ type: actionTypes.UPDATE_BALANCES })
      setDeposit({ ...deposit, tokenAmount: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawEther = async () => {
    setIsLoading(true)

    const exchange = state.contracts?.exchangeContract

    try {
      const tx = await exchange
        .connect(signer)
        .withdrawEther(ethers.utils.parseEther(deposit.ethAmount?.toString()))
      await tx.wait()

      dispatch({ type: actionTypes.UPDATE_BALANCES })
      setDeposit({ ...deposit, ethAmount: 0.0 })
    } finally {
      setIsLoading(false)
    }
  }
  const withdrawToken = async () => {
    setIsLoading(true)

    const exchangeContract = state.contracts?.exchangeContract

    try {
      const tx = await exchangeContract
        .connect(signer)
        .withdrawToken(
          state.contracts?.tokenContract?.address,
          ethers.utils.parseUnits(deposit.tokenAmount.toString())
        )
      await tx.wait()

      dispatch({ type: actionTypes.UPDATE_BALANCES })
      setDeposit({ ...deposit, tokenAmount: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex flexDirection="column" p="1rem" height="inherit" width="inherit">
      <Box>
        <Text fontSize="xl" style={{ fontWeight: "bold" }}>
          Balance
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
          <Tab>Deposit</Tab>
          <Tab>Withdraw</Tab>
        </TabList>
      </Tabs>

      <TableContainer mt="0.5rem">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Asset</Th>
              <Th>Wallet</Th>
              <Th>Exchange</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>ETH</Td>
              <Td isNumeric>
                {Number(
                  ethers.utils.formatEther(ether?.toString() || "0")
                ).toFixed(3)}
              </Td>
              <Td isNumeric>
                {Number(
                  ethers.utils.formatEther(exchangeEther?.toString() || "0")
                ).toFixed(3)}
              </Td>
            </Tr>

            <Tr>
              <Td>TOKEN</Td>
              <Td isNumeric>
                {Number(
                  ethers.utils.formatUnits(token?.toString() || "0")
                ).toFixed(3)}
              </Td>
              <Td isNumeric>
                {Number(
                  ethers.utils.formatUnits(exchangeToken?.toString() || "0")
                ).toFixed(3)}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      <Flex direction="column" fontSize="sm" mt="1rem">
        <Box mt="0.5rem">ETH Balance</Box>

        <Flex mt="0.5rem">
          <NumberInput
            placeholder="Eth Amount"
            value={deposit.ethAmount}
            onChange={(value: string) =>
              setDeposit({ ...deposit, ethAmount: Number(value) })
            }
            defaultValue={0.0}
            min={0.0}
            max={
              tabIndex === 0
                ? Number(ethers.utils.formatEther(ether || "0"))
                : Number(
                    ethers.utils.formatEther(exchangeEther?.toString() || "0")
                  )
            }
            step={0.01}
            maxW={150}
            mr="0.5rem"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <Slider
            flex="1"
            focusThumbOnChange={false}
            value={deposit.ethAmount}
            onChange={(value: number) =>
              setDeposit({ ...deposit, ethAmount: value })
            }
            max={
              tabIndex === 0
                ? Number(ethers.utils.formatEther(ether || "0"))
                : Number(
                    ethers.utils.formatEther(exchangeEther?.toString() || "0")
                  )
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Button
            bg="blue.500"
            ml="0.5rem"
            onClick={() => (tabIndex === 0 ? depositEth() : withdrawEther())}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : tabIndex === 0 ? "Deposit" : "Withdraw"}
          </Button>
        </Flex>

        <Box mt="0.5rem">Token Balance</Box>

        <Flex mt="0.5rem">
          <NumberInput
            placeholder="Token Amount"
            value={deposit.tokenAmount}
            onChange={(value: string) =>
              setDeposit({ ...deposit, tokenAmount: Number(value) })
            }
            defaultValue={0}
            min={0}
            max={
              tabIndex === 0
                ? Number(ethers.utils.formatUnits(token || "0"))
                : Number(
                    ethers.utils.formatUnits(exchangeToken?.toString() || "0")
                  )
            }
            step={1}
            maxW={150}
            mr="0.5rem"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <Slider
            flex="1"
            focusThumbOnChange={false}
            value={deposit.tokenAmount}
            onChange={(value: number) =>
              setDeposit({ ...deposit, tokenAmount: value })
            }
            max={
              tabIndex === 0
                ? Number(ethers.utils.formatUnits(token || "0"))
                : Number(
                    ethers.utils.formatUnits(exchangeToken?.toString() || "0")
                  )
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Button
            bg="blue.500"
            ml="0.5rem"
            onClick={() => (tabIndex === 0 ? depositToken() : withdrawToken())}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : tabIndex === 0 ? "Deposit" : "Withdraw"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Balance
