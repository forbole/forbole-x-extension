import { Secp256k1HdWallet } from '@cosmjs/launchpad'
import CryptoJS from 'crypto-js'
import { Wallet } from '../types'

export const decryptWallets = (encryptedWalletsString: string, password: string) => {
  try {
    const wallets = JSON.parse(
      CryptoJS.AES.decrypt(encryptedWalletsString, password).toString(CryptoJS.enc.Utf8)
    )
    return wallets
  } catch (err) {
    return null
  }
}

export const handleMessages = async (request: any, sender: any, sendResponse: any) => {
  if (request.event === 'ping') {
    chrome.storage.local.get(['wallets'], (result) => {
      sendResponse({
        isFirstTimeUser: !result.wallets,
      })
    })
  } else if (request.event === 'getWallets') {
    chrome.storage.local.get(['wallets'], (result) => {
      const { password } = request.data
      const wallets = decryptWallets(result.wallets, password)
      sendResponse(
        !wallets
          ? { err: 'incorrect password' }
          : {
              wallets: (wallets || []).map((w: Wallet) => ({
                name: w.name,
                id: w.id,
                cryptos: w.cryptos,
              })),
            }
      )
    })
  } else if (request.event === 'addWallet') {
    chrome.storage.local.get(['wallets'], (result) => {
      const { password, wallet } = request.data
      const wallets = decryptWallets(result.wallets, password)
      const walletToBeSaved = {
        name: wallet.name,
        cryptos: wallet.cryptos,
        mnemonic: CryptoJS.AES.encrypt(wallet.mnemonic, wallet.securityPassword).toString(),
        id: CryptoJS.SHA256(wallet.mnemonic).toString(),
      }
      const encryptedWalletsString = CryptoJS.AES.encrypt(
        JSON.stringify([walletToBeSaved, ...(wallets || [])]),
        password
      ).toString()
      chrome.storage.local.set({ wallets: encryptedWalletsString }, function () {
        sendResponse({
          wallet: {
            name: walletToBeSaved.name,
            id: walletToBeSaved.id,
            cryptos: walletToBeSaved.cryptos,
          },
        })
      })
    })
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
