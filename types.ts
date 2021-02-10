export type Cryptos = 'ATOM' | 'DSM'

export interface Wallet {
  id: string
  name: string
  mnemonic: string
  createdAt: number
}

export interface Account {
  walletId: string
  address: string
  crypto: string
  index: number
  name: string
  fav: boolean
  createdAt: number
}
