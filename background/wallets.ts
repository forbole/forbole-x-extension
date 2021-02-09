import decryptWallets from './misc/decryptWallets'
import { Wallet } from '../types'
import getWalletAddress from './misc/getWalletAddress'
import cryptocurrencies from './misc/cryptocurrencies.json'

export const getWallets = (password: string): Promise<Omit<Wallet, 'mnemonic'>[]> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], (result) => {
      const wallets = decryptWallets(result.wallets, password)
      if (!wallets) {
        reject(new Error('incorrect password'))
      } else {
        resolve(
          (wallets || []).map((w: Wallet) => ({
            name: w.name,
            id: w.id,
            createdAt: w.createdAt,
          }))
        )
      }
    })
  )

export const addWallet = (
  password: string,
  wallet: {
    name: string
    mnemonic: string
    cryptos: (keyof typeof cryptocurrencies)[]
    securityPassword: string
  }
): Promise<{ name: string; id: string; createdAt: number }> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], async (result) => {
      const wallets = decryptWallets(result.wallets, password)
      if (!wallets) {
        reject(new Error('incorrect password'))
      } else {
        const accounts = []
        for (let i = 0; i < wallet.cryptos.length; i += 1) {
          const address = await getWalletAddress(wallet.mnemonic, wallet.cryptos[i], 0)
          accounts.push({
            address,
            index: 0,
            name: wallet.cryptos[i],
            crypto: wallet.cryptos[i],
            fav: false,
          })
        }
        // TODO: add accounts
        const walletToBeSaved = {
          name: wallet.name,
          mnemonic: CryptoJS.AES.encrypt(wallet.mnemonic, wallet.securityPassword).toString(),
          id: CryptoJS.SHA256(wallet.mnemonic).toString(),
          createdAt: Date.now(),
        }
        const encryptedWalletsString = CryptoJS.AES.encrypt(
          JSON.stringify([walletToBeSaved, ...(wallets || [])]),
          password
        ).toString()
        chrome.storage.local.set({ wallets: encryptedWalletsString }, function () {
          resolve({
            name: walletToBeSaved.name,
            id: walletToBeSaved.id,
            createdAt: walletToBeSaved.createdAt,
          })
        })
      }
    })
  )
