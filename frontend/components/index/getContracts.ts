import { ethers } from "ethers"
import deployments from "../../public/deployments.json"

async function getContracts(
  chainId: number,
  provider: ethers.providers.Provider
) {
  if (!chainId) return null

  const deploymentChainData = deployments[`${chainId}`]
  if (!deploymentChainData) return null

  const contractData = deploymentChainData[0]
  if (!contractData) return null

  const tokenContract = new ethers.Contract(
    contractData.contracts.Token.address,
    contractData.contracts.Token.abi,
    provider
  )

  const exchangeContract = new ethers.Contract(
    contractData.contracts.Exchange.address,
    contractData.contracts.Exchange.abi,
    provider
  )

  return { contractData, tokenContract, exchangeContract }
}

export default getContracts
