import signAndBroadcastTransaction from '../misc/signAndBroadcastTransaction'
import sendMsgToBackground from './misc/sendMsgToBackground'
// eslint-disable-next-line import/newline-after-import
;(window as any).forboleX = {
  sendTransaction: (password: string, address: string, transactionData: any) => {
    window.postMessage(
      {
        target: 'Forbole X',
        event: 'sendTransaction',
        data: {
          password,
          address,
          transactionData,
        },
      },
      window.location.origin
    )
  },
  // Should only be accessed through Forbole X web app / Chrome Ext
  signAndBroadcastTransaction: async (
    extId: string,
    password: string,
    address: string,
    transactionData: any,
    securityPassword: string
  ) => {
    const { accounts } = await sendMsgToBackground(extId, {
      event: 'getAccounts',
      data: { password },
    })
    const account = accounts.find((a: any) => a.address === address)
    if (!account) {
      throw new Error('account not found')
    }
    const { mnemonic } = await sendMsgToBackground(extId, {
      event: 'viewMnemonicPhrase',
      data: { password, id: account.walletId, securityPassword },
    })
    const result = await signAndBroadcastTransaction(
      mnemonic,
      account.crypto,
      account.index,
      transactionData
    )
    return result
  },
}
