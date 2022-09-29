import { Box, Flex, Text } from "@chakra-ui/react"
import dynamic from "next/dynamic"
import React from "react"
import { chartConfig } from "./priceChart/chartConfig"
import useTradePriceChartEvents from "./priceChart/useTradePriceChartEvents"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const PriceChart: React.FC = () => {
  const [priceChartTrades, lastPrice, lastPriceChange] =
    useTradePriceChartEvents()

  return (
    <Flex direction="column" m="1rem" height="inherit" width="inherit">
      <Text fontSize="xl" style={{ fontWeight: "bold" }}>
        PriceChart
      </Text>

      <Flex mt="0.5rem">
        <Text>TOKEN/ETH: &nbsp;</Text>
        <Text color={lastPriceChange > 0 ? "green.200" : "red.200"}>
          {lastPriceChange > 0 ? <span>&#9650;</span> : <span>&#9660;</span>}
        </Text>
        &nbsp;
        {lastPrice}
      </Flex>

      {typeof window !== "undefined" && (
        <Chart
          // @ts-ignore
          options={chartConfig}
          series={[{ data: priceChartTrades }]}
          type="candlestick"
          width="90%"
          height="80%"
        />
      )}
    </Flex>
  )
}

export default PriceChart
