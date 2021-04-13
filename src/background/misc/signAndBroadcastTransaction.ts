import { coins, Secp256k1HdWallet, SigningCosmosClient } from '@cosmjs/launchpad'
import { Slip10RawIndex } from '@cosmjs/crypto'
import cryptocurrencies from './cryptocurrencies.json'
import cosmosTransactionTypeMap from './cosmosTransactionTypeMap'
import { TransactionType } from '../../../types'

// TODO
const formatCosmosTransactionMsg = ({ type, ...params }: any) => {
  switch (type) {
    case 'send':
    default:
      return {
        type: 'cosmos-sdk/MsgSend',
        value: {
          from_address: params.from,
          to_address: params.to,
          amount: coins(params.amount, params.denom),
        },
      }
  }
  // {
  //   "send": "cosmos-sdk/MsgSend",
  //   "delegate": "cosmos-sdk/MsgDelegate",
  //   "redelegate": "cosmos-sdk/MsgBeginRedelegate",
  //   "withdraw reward": "cosmos-sdk/MsgWithdrawDelegationReward"
  // }
}

const signAndBroadcastTransaction = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number,
  type: TransactionType,
  amount: { amount: number; denom: string },
  toAddress: string
): Promise<{ success: boolean }> => {
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
  const msg = formatCosmosTransactionMsg({
    type: cosmosTransactionTypeMap[type],
    value: {
      from_address: accounts[0].address,
      to_address: toAddress,
      amount: coins(amount.amount, amount.denom),
    },
  })
  const result = await client.signAndBroadcast([msg], cryptocurrencies[crypto].defaultGasFee)
  return { success: true }
}

export default signAndBroadcastTransaction
