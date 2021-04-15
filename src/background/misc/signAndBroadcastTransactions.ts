import { coins, Secp256k1HdWallet, SigningCosmosClient } from '../../../@cosmjs/launchpad'
import { Slip10RawIndex } from '../../../@cosmjs/crypto'
import cryptocurrencies from './cryptocurrencies.json'
import {
  Transaction,
  TransactionDelegate,
  TransactionRedelegate,
  TransactionSend,
  TransactionWithdrawReward,
} from '../../../types'

const formatCosmosTransactionMsg = ({ type, ...params }: Transaction) => {
  if (type === 'delegate') {
    const { delegator, validator, amount, denom } = params as TransactionDelegate
    return {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        delegator_address: delegator,
        validator_address: validator,
        amount: coins(amount, denom)[0],
      },
    }
  }
  if (type === 'redelegate') {
    const { delegator, fromValidator, toValidator, amount, denom } = params as TransactionRedelegate
    return {
      type: 'cosmos-sdk/MsgBeginRedelegate',
      value: {
        delegator_address: delegator,
        validator_src_address: fromValidator,
        validator_dst_address: toValidator,
        amount: coins(amount, denom)[0],
      },
    }
  }
  if (type === 'withdraw reward') {
    const { delegator, validator } = params as TransactionWithdrawReward
    return {
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        delegator_address: delegator,
        validator_address: validator,
      },
    }
  }
  if (type === 'send') {
    const { from, to, amount, denom } = params as TransactionSend
    return {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: from,
        to_address: to,
        amount: coins(amount, denom),
      },
    }
  }
  return null
}

const signAndBroadcastTransactions = async (
  mnemonic: string,
  crypto: keyof typeof cryptocurrencies,
  index: number,
  transactions: Transaction[],
  memo?: string
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
  const msgs: any = transactions.map((t) => formatCosmosTransactionMsg(t)).filter((t) => !!t)
  await client.signAndBroadcast(msgs, cryptocurrencies[crypto].defaultGasFee, memo)
  return { success: true }
}

export default signAndBroadcastTransactions
