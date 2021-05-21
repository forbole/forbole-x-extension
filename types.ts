import cryptocurrencies from './src/background/misc/cryptocurrencies.json'

export type Cryptos = keyof typeof cryptocurrencies

export interface Wallet {
  id: string
  type: 'mnemonic' | 'ledger'
  name: string
  mnemonic?: string // For mnemonic type
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
  name: string
  type: 'mnemonic' | 'ledger'
  mnemonic?: string // For mnemonic type
  addresses?: string[] // For ledger type
  cryptos: Cryptos[]
  securityPassword: string
}
