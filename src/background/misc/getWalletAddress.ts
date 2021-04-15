import { Secp256k1HdWallet } from '../../../@cosmjs/launchpad'
import { Slip10RawIndex } from '../../../@cosmjs/crypto'
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
  return accounts[0].address
}

export default getWalletAddress
