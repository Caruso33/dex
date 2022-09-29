import { Box, Button, Code, Flex, Link, Text } from "@chakra-ui/react"
import React from "react"
import { useConnect, useDisconnect } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import useAppState from "../../state"

const Navbar: React.FC = () => {
  return (
    <Flex justifyContent="space-between" alignItems="center" h="100%" mx="1rem">
      <Box>
        <Text fontSize="2xl" fontWeight="medium" letterSpacing="0.3rem">
          TOKEN Exchange
        </Text>
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems="center"
        h="100%"
        mx="1rem"
      >
        <Wallet />
      </Flex>
    </Flex>
  )
}

function Wallet() {
  const [state] = useAppState()

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  const { disconnect } = useDisconnect()

  const userAddress = state.user?.account?.address

  if (userAddress) {
    const userNetwork = state?.user?.chain?.name
    const isEthMainnet = userNetwork === "Ethereum"
    const isPolyMainnet = userNetwork === "Polygon"

    const ethSubNets = ["Ropsten", "Kovan", "Rinkeby", "Goerli"]
    const isEthSubnet = ethSubNets.includes(userNetwork)

    const polySubNets = ["Polygon", "Polygon Mumbai"]
    const isPolySubnet = polySubNets.includes(userNetwork)

    let hrefLink = ""
    if (isEthMainnet) {
      hrefLink = `https://etherscan.io/address/${userAddress}`
    } else if (isEthSubnet) {
      hrefLink = `https://${userNetwork}.etherscan.io/address/${userAddress}`
    } else if (isPolyMainnet) {
      hrefLink = `https://polygonscan.com/search?q=${userAddress}`
    } else if (isPolySubnet) {
      hrefLink = `https://mumbai.polygonscan.com/search?q=${userAddress}`
    }

    return (
      <>
        <Text>Connected to</Text>
        <Link href={hrefLink}>
          <Code>{state.user?.account?.address}</Code>
        </Link>

        <Text ml="0.5rem">on {state.user?.chain?.name}</Text>

        <Button
          bg="blue.800"
          size="sm"
          ml="0.5rem"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </>
    )
  }

  return (
    <Button bg="blue.800" size="sm" onClick={() => connect()}>
      Connect Wallet
    </Button>
  )
}

export default Navbar
