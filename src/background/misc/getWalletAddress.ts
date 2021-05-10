import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { stringToPath } from '@cosmjs/crypto'
import cryptocurrencies from './cryptocurrencies.json'

const getWalletAddress = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number
): Promise<string> => {
  // if (crypto === 'SOL') {
  //   const { getPubkeyFromConfig, SignerConfig } = await import('bd-solana-wasm')
  //   const address = getPubkeyFromConfig(new SignerConfig('', mnemonic, ''))
  //   return address
  // }
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(`m/44'/${cryptocurrencies[crypto].coinType}'/0'/0/${index}`)],
    prefix: cryptocurrencies[crypto].prefix,
  })
  const accounts = await wallet.getAccounts()
  return accounts[0].address
}

export default getWalletAddress
