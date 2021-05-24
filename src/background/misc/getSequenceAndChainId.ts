import { SigningStargateClient } from '@cosmjs/stargate'
import cryptocurrencies from './cryptocurrencies.json'

const getSequenceAndChainId = async (
  address: string,
  crypto: keyof typeof cryptocurrencies
): Promise<any> => {
  const client = await SigningStargateClient.connect(cryptocurrencies[crypto].rpcEndpoint)
  const { accountNumber, sequence } = await client.getSequence(address)
  const chainId = await client.getChainId()
  return { accountNumber, sequence, chainId }
}

export default getSequenceAndChainId
