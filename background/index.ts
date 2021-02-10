import { Secp256k1HdWallet } from '@cosmjs/launchpad'
import CryptoJS from 'crypto-js'
import { getAccounts } from './accounts'
import { addWallet, getWallets } from './wallets'

export const handleMessages = async (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): Promise<void> => {
  if (request.event === 'ping') {
    chrome.storage.local.get(['wallets'], (result) => {
      sendResponse({
        isFirstTimeUser: !result.wallets,
      })
    })
  } else if (request.event === 'getWallets') {
    try {
      const wallets = await getWallets(request.data.password)
      sendResponse({ wallets })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'getAccounts') {
    try {
      const accounts = await getAccounts(request.data.password)
      sendResponse({ accounts })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'addWallet') {
    try {
      const { wallet, accounts } = await addWallet(request.data.password, request.data.wallet)
      sendResponse({ wallet, accounts })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'generateMnemonic') {
    const { mnemonic } = await Secp256k1HdWallet.generate(24)
    sendResponse({ mnemonic })
  } else if (request.event === 'verifyMnemonic') {
    try {
      const { mnemonic } = await Secp256k1HdWallet.fromMnemonic(request.data.mnemonic)
      sendResponse({ mnemonic })
    } catch (err) {
      sendResponse({ err: 'invalid mnemonic' })
    }
  } else if (request.event === 'verifyMnemonicBackup') {
    try {
      const mnemonicPhrase = CryptoJS.AES.decrypt(
        request.data.backupPhrase,
        request.data.password
      ).toString(CryptoJS.enc.Utf8)
      const { mnemonic } = await Secp256k1HdWallet.fromMnemonic(mnemonicPhrase)
      sendResponse({ mnemonic })
    } catch (err) {
      sendResponse({ err: 'invalid mnemonic backup' })
    }
  } else {
    sendResponse({ error: 'unknown event' })
  }
}

chrome.runtime.onMessageExternal.addListener(handleMessages)
