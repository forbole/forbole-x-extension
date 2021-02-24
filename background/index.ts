import { Secp256k1HdWallet } from '@cosmjs/launchpad'
import CryptoJS from 'crypto-js'
import { addAccount, deleteAccount, getAccounts, updateAccount } from './accounts'
import {
  addWallet,
  deleteWallet,
  getWallets,
  updateWallet,
  verifySecurityPassword,
  viewMnemonicPhrase,
} from './wallets'

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
  } else if (request.event === 'addWallet') {
    try {
      const { wallet, accounts } = await addWallet(request.data.password, request.data.wallet)
      sendResponse({ wallet, accounts })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'updateWallet') {
    try {
      const wallet = await updateWallet(request.data.password, request.data.id, request.data.wallet)
      sendResponse({ wallet })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'deleteWallet') {
    try {
      const result = await deleteWallet(request.data.password, request.data.id)
      sendResponse(result)
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
  } else if (request.event === 'addAccount') {
    try {
      const account = await addAccount(
        request.data.password,
        request.data.account,
        request.data.securityPassword
      )
      sendResponse({ account })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'updateAccount') {
    try {
      const account = await updateAccount(
        request.data.password,
        request.data.address,
        request.data.account
      )
      sendResponse({ account })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'deleteAccount') {
    try {
      const result = await deleteAccount(request.data.password, request.data.address)
      sendResponse(result)
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
  } else if (request.event === 'verifySecurityPassword') {
    try {
      const result = await verifySecurityPassword(
        request.data.password,
        request.data.id,
        request.data.securityPassword
      )
      sendResponse(result)
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else if (request.event === 'viewMnemonicPhrase') {
    try {
      const mnemonic = await viewMnemonicPhrase(
        request.data.password,
        request.data.id,
        request.data.securityPassword,
        request.data.backupPassword
      )
      sendResponse({ mnemonic })
    } catch (err) {
      sendResponse({ err: err.message })
    }
  } else {
    sendResponse({ err: 'unknown event' })
  }
}

chrome.runtime.onMessageExternal.addListener(handleMessages)
