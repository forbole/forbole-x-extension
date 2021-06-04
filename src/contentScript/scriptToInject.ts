import signAndBroadcastTransaction from '../misc/signAndBroadcastTransaction'
import sendMsgToBackground from './misc/sendMsgToBackground'
// eslint-disable-next-line import/newline-after-import
;(window as any).forboleX = {
  sendTransaction: (password: string, address: string, transactionData: any) =>
    new Promise((resolve, reject) => {
      // Trigger background script to open chrome extension
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
      // Receive broadcast when transaction is done, see below `signAndBroadcastTransaction`
      const channel = new BroadcastChannel('forbole-x')
      const listener = async (e: any) => {
        if (e.data.event === 'transactionSuccess') {
          resolve(e.data.data)
        }
        if (e.data.event === 'transactionFail') {
          reject(e.data.data)
        }
        channel.removeEventListener('message', listener)
      }
      channel.addEventListener('message', listener)
    }),

  // Should only be accessed through Forbole X web app / Chrome Ext
  signAndBroadcastTransaction: async (
    extId: string,
    password: string,
    address: string,
    transactionData: any,
    securityPassword: string
  ) => {
    const channel = new BroadcastChannel('forbole-x')
    try {
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
      channel.postMessage({
        event: 'transactionSuccess',
        data: result,
      })
      return result
    } catch (err) {
      channel.postMessage({
        event: 'transactionFail',
        data: err,
      })
      throw err
    }
  },
}
