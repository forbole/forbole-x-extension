import cryptocurrencies from './src/background/misc/cryptocurrencies.json'

export type Cryptos = keyof typeof cryptocurrencies

export interface Wallet {
  id: string
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
  name: string
  mnemonic: string
  cryptos: Cryptos[]
  securityPassword: string
}

export interface TransactionDelegate {
  type: 'delegate'
  delegator: string
  validator: string
  amount: number
  denom: string
}

export interface TransactionRedelegate {
  type: 'redelegate'
  delegator: string
  fromValidator: string
  toValidator: string
  amount: number
  denom: string
}

export interface TransactionWithdrawReward {
  type: 'withdraw reward'
  delegator: string
  validator: string
}

export interface TransactionSend {
  type: 'send'
  from: string
  to: string
  amount: number
  denom: string
}

export type Transaction =
  | TransactionDelegate
  | TransactionRedelegate
  | TransactionWithdrawReward
  | TransactionSend
