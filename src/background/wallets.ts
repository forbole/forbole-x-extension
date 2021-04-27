import CryptoJS from 'crypto-js'
import decryptStorage from './misc/decryptStorage'
import decryptMnemonic from './misc/decryptMnemonic'
import { Wallet, Account, CreateWalletParams } from '../../types'
import getWalletAddress from './misc/getWalletAddress'
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
  wallet: CreateWalletParams
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

export const updateWallet = (
  password: string,
  id: string,
  wallet: {
    name?: string
    securityPassword?: string
    newSecurityPassword?: string
  }
): Promise<{ name: string; id: string; createdAt: number }> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], async (result) => {
      try {
        const wallets = await decryptStorage<Wallet[]>(result.wallets, password, [])
        const walletToBeUpdated = wallets.find((w) => w.id === id)
        if (!walletToBeUpdated) {
          throw new Error('wallet not found')
        }
        if (wallet.name) {
          walletToBeUpdated.name = wallet.name
        }
        if (wallet.securityPassword && wallet.newSecurityPassword) {
          const mnemonic = await decryptMnemonic(
            walletToBeUpdated.mnemonic,
            wallet.securityPassword
          )
          walletToBeUpdated.mnemonic = CryptoJS.AES.encrypt(
            mnemonic,
            wallet.newSecurityPassword
          ).toString()
        }
        const encryptedWalletsString = CryptoJS.AES.encrypt(
          JSON.stringify(wallets.map((w) => (w.id === id ? walletToBeUpdated : w))),
          password
        ).toString()
        return chrome.storage.local.set({ wallets: encryptedWalletsString }, () => {
          resolve({
            name: walletToBeUpdated.name,
            id: walletToBeUpdated.id,
            createdAt: walletToBeUpdated.createdAt,
          })
        })
      } catch (err) {
        return reject(err)
      }
    })
  )

export const deleteWallet = (password: string, id: string): Promise<{ success: boolean }> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets', 'accounts'], async (result) => {
      try {
        const wallets = await decryptStorage<Wallet[]>(result.wallets, password, [])
        const accounts = await decryptStorage<Account[]>(result.accounts, password, [])
        const filteredWallets = wallets.filter((w) => w.id !== id)
        const filteredAccounts = accounts.filter((a) => a.walletId !== id)
        if (!filteredWallets.length) {
          return chrome.storage.local.remove(['wallets', 'accounts'], () => {
            resolve({ success: true })
          })
        }
        const encryptedWalletsString = CryptoJS.AES.encrypt(
          JSON.stringify(filteredWallets),
          password
        ).toString()
        const encryptedAccountsString = CryptoJS.AES.encrypt(
          JSON.stringify(filteredAccounts),
          password
        ).toString()
        return chrome.storage.local.set(
          { wallets: encryptedWalletsString, accounts: encryptedAccountsString },
          () => {
            resolve({ success: true })
          }
        )
      } catch (err) {
        return reject(err)
      }
    })
  )

export const viewMnemonicPhrase = (
  password: string,
  id: string,
  securityPassword: string
): Promise<string> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['wallets'], async (result) => {
      try {
        const wallets = await decryptStorage<Wallet[]>(result.wallets, password)
        const wallet = wallets.find((w) => w.id === id)
        if (!wallet) {
          return reject(new Error('wallet not found'))
        }
        const mnemonic = await decryptMnemonic(wallet.mnemonic, securityPassword)
        return resolve(mnemonic)
      } catch (err) {
        return reject(new Error('incorrect password'))
      }
    })
  )

export const viewMnemonicPhraseBackup = async (
  password: string,
  id: string,
  securityPassword: string,
  backupPassword: string
): Promise<string> => {
  const mnemonic = await viewMnemonicPhrase(password, id, securityPassword)
  return CryptoJS.AES.encrypt(mnemonic, backupPassword).toString()
}
