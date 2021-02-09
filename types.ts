export type Cryptos = 'ATOM' | 'DSM'

export interface Wallet {
  id: string
  name: string
  mnemonic: string
  createdAt: number
}
