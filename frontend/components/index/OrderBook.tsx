import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tooltip,
  Tr,
} from "@chakra-ui/react"
import { BigNumber } from "ethers"
import React, { useState } from "react"
import { useSigner } from "wagmi"
import useAppState from "../../state"
import { eventTypes } from "../../state/reducers/events"
import useMakeOrderEvents, {
  MakeOrderEventEnhanced,
} from "./trades/useMakeOrderEvents"

const OrderBook: React.FC = () => {
  const [, buyOrders, sellOrders] = useMakeOrderEvents()
  const [isTrading, setIsTrading] = useState<boolean>(false)

  const { data: signer } = useSigner()

  const [state, dispatch] = useAppState()

  const fillOrder = async (order: MakeOrderEventEnhanced) => {
    if (isTrading) return

    const exchange = state.contracts?.exchangeContract

    setIsTrading(true)

    try {
      const tradeEvents = [
        {
          amountGet: order.amountGet,
          amountGive: order.amountGive,
          id: order.id,
          orderUser: order.user,
          timestamp: BigNumber.from(Math.floor(new Date().getTime() / 1000)),
          tokenGet: order.tokenGet,
          tokenGive: order.tokenGive,
          trader: state.user.account?.address,
        },
      ]

      await exchange.connect(signer).fillOrder(order.id.toNumber())
      dispatch({ type: eventTypes.ADD_TRADES, data: tradeEvents })
    } finally {
      setIsTrading(false)
    }
  }

  return (
    <Flex flexDirection="column" p="1rem" height="100%">
      <Text fontSize="xl" style={{ fontWeight: "bold" }}>
        OrderBook
      </Text>

      <TableContainer overflowX="auto" overflowY="auto" mt="1rem" h="45%">
        <Table variant="simple" fontSize="sm">
          <Tbody>
            {buyOrders.map((order: MakeOrderEventEnhanced, index: number) => (
              <Tooltip label="Click to Sell" key={"bid" + index}>
                <Tr onClick={() => fillOrder(order)}>
                  <Td isNumeric>{order.tokenAmount}</Td>
                  <Td isNumeric color="green.200">
                    {order.tokenPrice}
                  </Td>
                  <Td isNumeric>{order.etherAmount}</Td>
                </Tr>
              </Tooltip>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <TableContainer overflowX="auto" overflowY="auto" h="10%">
        <Table variant="simple" fontSize="sm">
          <Tbody>
            <Tr>
              <Td>TOKEN</Td>
              <Td>TOKEN/ETH</Td>
              <Td>ETH</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      <TableContainer overflowX="auto" overflowY="auto" h="45%">
        <Table variant="simple" fontSize="sm">
          <Tbody>
            {sellOrders
              .reverse()
              .map((order: MakeOrderEventEnhanced, index: number) => (
                <Tooltip label="Click to Buy" key={"ask" + index}>
                  <Tr onClick={() => fillOrder(order)}>
                    <Td isNumeric>{order.tokenAmount}</Td>
                    <Td isNumeric color="red.200">
                      {order.tokenPrice}
                    </Td>
                    <Td isNumeric>{order.etherAmount}</Td>
                  </Tr>
                </Tooltip>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  )
}

export default OrderBook
