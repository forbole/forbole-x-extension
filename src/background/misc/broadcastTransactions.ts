import { SigningStargateClient } from '@cosmjs/stargate'
import cryptocurrencies from './cryptocurrencies.json'

const broadcastTransactions = async (
  crypto: keyof typeof cryptocurrencies,
  signed: any
): Promise<any> => {
  const client = await SigningStargateClient.connect(cryptocurrencies[crypto].rpcEndpoint)
  const result = await client.broadcastTx(new Uint8Array(Object.values(signed)))
  return result
}

export default broadcastTransactions
