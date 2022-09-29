import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import formatISO9075 from "date-fns/formatISO9075"
import React from "react"
import useTradeEvents, { TradeEventEnhanced } from "./trades/useTradeEvents"

const Trades: React.FC = () => {
  const [tradeEvents] = useTradeEvents()

  return (
    <Flex p="1rem" direction="column">
      <Text fontSize="xl" style={{ fontWeight: "bold" }}>
        Trades
      </Text>

      <TableContainer mt="1rem" overflowY="auto">
        <Table variant="simple" fontSize="sm">
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>TOKEN</Th>
              <Th>TOKEN/ETH</Th>
            </Tr>
          </Thead>

          <Tbody>
            {tradeEvents.map((tradeEvent: TradeEventEnhanced) => (
              <Tr key={`tradeevent-${tradeEvent.id.toNumber()}`}>
                <Td>{formatISO9075(tradeEvent.dateTime)}</Td>
                <Td isNumeric>{tradeEvent.tokenAmount}</Td>
                <Td isNumeric>
                  <Text
                    color={
                      tradeEvent.didPriceIncrease ? "green.200" : "red.200"
                    }
                  >
                    {tradeEvent.tokenPrice}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  )
}

export default Trades
