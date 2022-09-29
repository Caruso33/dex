import { Center, Flex, Grid, GridItem, Text } from "@chakra-ui/react"
import {
  useLoadDepositEvents,
  useLoadWithdrawalEvents,
} from "../../hooks/useLoadDepositEvents"
import {
  useLoadCancelOrderEvents,
  useLoadMakeOrderEvents,
  useLoadTradeOrderEvents,
} from "../../hooks/useLoadOrderEvents"
import useSubscribeEvents from "../../hooks/useSubscribeEvents"
import useAppState from "../../state"
import { Navbar } from "../layout"
import {
  Balance,
  MyTransactions,
  NewOrder,
  OrderBook,
  PriceChart,
  Trades,
} from "./index"

export default function MainContent() {
  const [state] = useAppState()

  useLoadMakeOrderEvents()
  useLoadCancelOrderEvents()
  useLoadTradeOrderEvents()

  useLoadDepositEvents()
  useLoadWithdrawalEvents()

  // useSubscribeEvents()

  let content = null
  if (!state.user?.account?.address) {
    content = (
      <GridItem colSpan={7} rowSpan={1} m="5rem" bg="blue.800">
        <Center height="100%">
          <Text>Please connect to your wallet</Text>
        </Center>
      </GridItem>
    )
  } else if (!state.contracts?.contractData) {
    content = (
      <GridItem colSpan={7} rowSpan={1} m="5rem" bg="blue.800">
        <Flex direction="column" justify="center" align="center" height="100%">
          <Text>The current chain has no deployment. </Text>

          <Text mt="0.5rem">Please change the network. </Text>

          <Text mt="0.5rem">
            Current supported chains {["Polygon Mumbai"].join(", ")}
          </Text>
        </Flex>
      </GridItem>
    )
  } else {
    content = (
      <>
        <GridItem
          gridRow="2 / 3"
          gridColumn="2 / span 1"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <Balance />
        </GridItem>

        <GridItem
          gridRow="2 / 4"
          gridColumn="3 / 4"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <OrderBook />
        </GridItem>

        <GridItem
          gridRow="2 / span 1"
          gridColumn="4 / 6"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <PriceChart />
        </GridItem>

        <GridItem
          gridRow="2 / span 2"
          gridColumn="6"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <Trades />
        </GridItem>

        <GridItem
          gridRow="3 / span 1"
          gridColumn="2"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <NewOrder />
        </GridItem>

        <GridItem
          gridRow="3 / 4"
          gridColumn="4 / span 2"
          width="100%"
          height="100%"
          bg="blue.800"
        >
          <MyTransactions />
        </GridItem>
      </>
    )
  }

  return (
    <Grid
      templateColumns="0 repeat(5, 1fr) 0"
      templateRows="5vh repeat(2, 47vh) 0"
      gap={3}
    >
      <GridItem
        gridRow="1 / span 1"
        gridColumn="2 / 7"
        h="5vh"
        minHeight="10"
        width="100%"
        height="100%"
        bg="blue.500"
      >
        <Navbar />
      </GridItem>

      {content}
    </Grid>
  )
}
