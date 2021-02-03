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

export const handleMessages = (request, sender, sendResponse) => {
  switch (request.event) {
    case 'ping':
      chrome.storage.local.get(['wallets'], (result) => {
        sendResponse({
          isFirstTimeUser: !result.wallets,
        })
      })
      break
    case 'getWallets':
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
      break
    case 'addWallet':
      chrome.storage.local.get(['wallets'], (result) => {
        const { password, wallet } = request.data
        const wallets = decryptWallets(result.wallets, password)
        if (!wallets) {
          sendResponse({ err: 'incorrect password' })
        } else {
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
        }
      })
      break
    default:
      sendResponse({ error: 'unknown event' })
  }
}

chrome.runtime.onMessageExternal.addListener(handleMessages)
