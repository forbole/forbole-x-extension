import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { stringToPath } from '@cosmjs/crypto'
import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'
import cryptocurrencies from './cryptocurrencies.json'

const signAndBroadcastTransactions = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number,
  msgs: any[],
  gasFee: any,
  memo?: string
): Promise<any> => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(`m/44'/${cryptocurrencies[crypto].coinType}'/0'/0/${index}`)],
    prefix: cryptocurrencies[crypto].prefix,
  })
  const accounts = await wallet.getAccounts()
  const client = await SigningStargateClient.connectWithSigner(
    cryptocurrencies[crypto].rpcEndpoint,
    wallet,
    {
      gasPrice: GasPrice.fromString(cryptocurrencies[crypto].gasPrice),
      gasLimits: cryptocurrencies[crypto].gasLimits,
    }
  )
  const result = await client.signAndBroadcast(accounts[0].address, msgs, gasFee, memo)
  return result
}

export default signAndBroadcastTransactions
