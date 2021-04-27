import cryptocurrencies from './src/background/misc/cryptocurrencies.json'

export type Cryptos = keyof typeof cryptocurrencies

export type WalletType = 'mnemonic' | 'ledger'

export interface Wallet {
  id: string
  type: WalletType
  name: string
  mnemonic: string
  createdAt: number
}

export interface Account {
  walletId: string
  address: string
  crypto: Cryptos
  index: number
  name: string
  fav: boolean
  createdAt: number
}

export interface CreateAccountParams {
  walletId: string
  address?: string
  index?: number
  name: string
  crypto: Cryptos
}

export interface CreateWalletParams {
  type: WalletType
  name: string
  mnemonic: string
  cryptos: Cryptos[]
  securityPassword: string
}
