import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { stringToPath } from '@cosmjs/crypto'
import { LedgerSigner } from '@cosmjs/ledger-amino'
import { SigningStargateClient } from '@cosmjs/stargate'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import cryptocurrencies from './cryptocurrencies.json'

const signAndBroadcastTransactions = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number,
  transactionData: any
): Promise<any> => {
  let signer
  const signerOptions = {
    hdPaths: [stringToPath(`m/44'/${cryptocurrencies[crypto].coinType}'/0'/0/${index}`)],
    prefix: cryptocurrencies[crypto].prefix,
  }
  if (mnemonic) {
    signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, signerOptions)
  } else {
    const transport = await TransportWebUSB.create()
    signer = new LedgerSigner(transport, signerOptions as any)
  }
  const accounts = await signer.getAccounts()
  const client = await SigningStargateClient.connectWithSigner(
    cryptocurrencies[crypto].rpcEndpoint,
    signer
  )
  const result = await client.signAndBroadcast(
    accounts[0].address,
    transactionData.msgs,
    transactionData.gas_fee,
    transactionData.memo
  )
  return result
}

export default signAndBroadcastTransactions
