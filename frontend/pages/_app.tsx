import { ChakraProvider } from "@chakra-ui/react"
import { getDefaultProvider, providers } from "ethers"
import type { AppProps } from "next/app"
import {
  chain,
  configureChains,
  createClient,
  defaultChains,
  WagmiConfig,
} from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { publicProvider } from "wagmi/providers/public"
import { appReducers, initialState } from "../state"
import { AppStateProvider } from "../state/context"
import "../styles/globals.css"

// Provider returns an ethers.js interface for reading/writing data.
// Connectors are used for managing wallet connections, listening to account/chain changes, etc.

const { chains } = configureChains(
  [
    ...defaultChains,
    chain.polygon,
    chain.polygonMumbai,
    chain.hardhat,
    chain.localhost,
  ],
  [publicProvider()]
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider: (config) => {
    if (config.chainId === chain.localhost.id)
      return new providers.JsonRpcProvider()

    return getDefaultProvider(config.chainId)
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AppStateProvider reducer={appReducers} initialState={initialState}>
        <WagmiConfig client={wagmiClient}>
          <Component {...pageProps} />
        </WagmiConfig>
      </AppStateProvider>
    </ChakraProvider>
  )
}

export default MyApp
