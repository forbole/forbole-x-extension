import camelCase from 'lodash/camelCase'

const typeUrlMap: any = {
  'cosmos-sdk/MsgDelegate': '/cosmos.staking.v1beta1.MsgDelegate',
  'cosmos-sdk/MsgUndelegate': '/cosmos.staking.v1beta1.MsgUndelegate',
  'cosmos-sdk/MsgBeginRedelegate': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  'cosmos-sdk/MsgWithdrawDelegationReward':
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  'cosmos-sdk/MsgSend': '/cosmos.bank.v1beta1.MsgSend',
}

const formatTransactionMsg = (msg: any) => {
  const transformedMsg: any = {}
  transformedMsg.typeUrl = typeUrlMap[msg.type]
  transformedMsg.value = {}
  Object.keys(msg.value).forEach((k) => {
    transformedMsg.value[camelCase(k)] = msg.value[k]
  })
  return transformedMsg
}

export default formatTransactionMsg
