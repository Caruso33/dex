import {
  Button,
  Flex,
  Spinner,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import formatISO9075 from "date-fns/formatISO9075"
import React, { useState } from "react"
import { useSigner } from "wagmi"
import useAppState from "../../state"
import useMakeOrderEvents, {
  MakeOrderEventEnhanced,
} from "./trades/useMakeOrderEvents"
import useTradeEvents, { TradeEventEnhanced } from "./trades/useTradeEvents"

const MyTransactions: React.FC = () => {
  const [state] = useAppState()

  const { data: signer } = useSigner()

  const [, myTradeEvents] = useTradeEvents()
  const makeOrderEvents = useMakeOrderEvents()
  const [, , , myOrders] = makeOrderEvents

  const [isCanceling, setIsCanceling] = useState<number>(0)

  async function cancelOrder(eventId: number) {
    const exchange = state.contracts?.exchangeContract
    setIsCanceling(eventId)

    try {
      await exchange.connect(signer).cancelOrder(eventId)
    } finally {
      setIsCanceling(0)
    }
  }

  return (
    <Flex direction="column" p="1rem" height="100%">
      <Text fontSize="xl" style={{ fontWeight: "bold" }}>
        MyTransactions
      </Text>

      <Tabs isFitted mt="1rem" overflowY="auto">
        <TabList>
          <Tab>Trades</Tab>
          <Tab>Orders</Tab>
        </TabList>

        <TabPanels fontSize="sm">
          <TabPanel>
            <TableContainer>
              <Table variant="simple" fontSize="sm">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>TOKEN</Th>
                    <Th>TOKEN/ETH</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {myTradeEvents.map((event: TradeEventEnhanced, i: number) => (
                    <Tr key={`my-trades-${i}`}>
                      <Td>{formatISO9075(event.dateTime)}</Td>
                      <Td isNumeric>
                        <Text
                          color={event.hasUserBought ? "green.200" : "red.200"}
                        >
                          {event.hasUserBought ? "+" : "-"}
                          {event.tokenAmount}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text
                          color={event.hasUserBought ? "green.200" : "red.200"}
                        >
                          {event.tokenPrice}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel>
            <TableContainer>
              <Table variant="simple" fontSize="sm">
                <Thead>
                  <Tr>
                    <Th>Amount</Th>
                    <Th>TOKEN/ETH</Th>
                    <Th>Cancel</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {myOrders.map((event: MakeOrderEventEnhanced, i: number) => (
                    <Tr key={`my-orders-${i}`}>
                      <Td isNumeric>
                        <Text
                          color={
                            event.orderType === "buy" ? "green.200" : "red.200"
                          }
                        >
                          {event.tokenAmount}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text
                          color={
                            event.orderType === "buy" ? "green.200" : "red.200"
                          }
                        >
                          {event.tokenPrice}
                        </Text>
                      </Td>
                      <Td>
                        <Button
                          variant="ghost"
                          onClick={() => cancelOrder(event.id.toNumber())}
                          disabled={isCanceling !== 0}
                          w="3rem"
                        >
                          {isCanceling === event.id.toNumber() ? (
                            <Spinner size="sm" />
                          ) : (
                            "X"
                          )}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
}

export default MyTransactions
