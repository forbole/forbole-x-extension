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
  crypto: string
  index: number
  name: string
  fav: boolean
  createdAt: number
}

export interface CreateAccountParams {
  walletId: string
  address: string
  index: number
  name: string
  crypto: string
}

export interface CreateWalletParams {
  name: string
  type: 'mnemonic' | 'ledger'
  mnemonic?: string // For mnemonic type
  addresses: string[]
  cryptos: string[]
  securityPassword: string
}
