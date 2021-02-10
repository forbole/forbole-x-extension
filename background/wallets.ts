import CryptoJS from 'crypto-js'
import decryptStorage from './misc/decryptStorage'
import { Wallet, Account } from '../types'
import getWalletAddress from './misc/getWalletAddress'
import cryptocurrencies from './misc/cryptocurrencies.json'
import { addAccount } from './accounts'

export const getWallets = (password: string): Promise<Omit<Wallet, 'mnemonic'>[]> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], async (result) => {
      try {
        const wallets = await decryptStorage<Wallet[]>(result.wallets, password)
        resolve(
          (wallets || []).map((w: Wallet) => ({
            name: w.name,
            id: w.id,
            createdAt: w.createdAt,
          }))
        )
      } catch (err) {
        reject(err)
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
): Promise<{ wallet: { name: string; id: string; createdAt: number }; accounts: Account[] }> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], async (result) => {
      try {
        const wallets = await decryptStorage<Wallet[]>(result.wallets, password, [])
        const newAccounts: Account[] = []
        const walletToBeSaved = {
          name: wallet.name,
          mnemonic: CryptoJS.AES.encrypt(wallet.mnemonic, wallet.securityPassword).toString(),
          id: CryptoJS.SHA256(wallet.mnemonic).toString(),
          createdAt: Date.now(),
        }
        for (let i = 0; i < wallet.cryptos.length; i += 1) {
          const address = await getWalletAddress(wallet.mnemonic, wallet.cryptos[i], 0)
          const newAccount = await addAccount(password, {
            walletId: walletToBeSaved.id,
            address,
            index: 0,
            name: wallet.cryptos[i],
            crypto: wallet.cryptos[i],
            fav: false,
          })
          newAccounts.push(newAccount)
        }
        const encryptedWalletsString = CryptoJS.AES.encrypt(
          JSON.stringify([walletToBeSaved, ...(wallets || [])]),
          password
        ).toString()
        chrome.storage.local.set({ wallets: encryptedWalletsString }, () => {
          resolve({
            wallet: {
              name: walletToBeSaved.name,
              id: walletToBeSaved.id,
              createdAt: walletToBeSaved.createdAt,
            },
            accounts: newAccounts,
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  )
