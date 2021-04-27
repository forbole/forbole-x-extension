import { Secp256k1HdWallet, SigningCosmosClient } from '../../../@cosmjs/launchpad'
import { Slip10RawIndex } from '../../../@cosmjs/crypto'
import cryptocurrencies from './cryptocurrencies.json'

const signAndBroadcastTransactions = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number,
  msgs: any[],
  gasFee: any,
  memo?: string
): Promise<any> => {
  const wallet = await Secp256k1HdWallet.fromMnemonic(
    mnemonic,
    [
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(cryptocurrencies[crypto].coinType),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(index),
    ],
    cryptocurrencies[crypto].prefix
  )
  const accounts = await wallet.getAccounts()
  const client = new SigningCosmosClient(
    cryptocurrencies[crypto].lcdApi,
    accounts[0].address,
    wallet
  )
  const result = await client.signAndBroadcast(msgs, gasFee, memo)
  return result
}

export default signAndBroadcastTransactions
