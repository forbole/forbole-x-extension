import CryptoJS from 'crypto-js'
import decryptStorage from '../misc/decryptStorage'
import { Account, CreateAccountParams, Wallet } from '../../../types'
import decryptMnemonic from '../misc/decryptMnemonic'
import getWalletAddress from '../misc/getWalletAddress'

export const getAccounts = (password: string): Promise<Account[]> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['accounts'], async (result) => {
      try {
        const accounts = await decryptStorage<Account[]>(result.accounts, password)
        resolve(accounts || [])
      } catch (err) {
        reject(err)
      }
    })
  )

export const addAccount = (
  password: string,
  account: CreateAccountParams,
  securityPassword?: string
): Promise<Account> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['accounts', 'wallets'], async (result) => {
      try {
        const accounts = await decryptStorage<Account[]>(result.accounts, password, [])
        let { address, index } = account
        if (!address || index === undefined) {
          const wallets = await decryptStorage<Wallet[]>(result.wallets, password)
          const wallet = wallets.find((w) => w.id === account.walletId)
          if (!wallet) {
            throw new Error('wallet not found')
          }
          const mnemonic = wallet.mnemonic
            ? await decryptMnemonic(wallet.mnemonic, securityPassword || '')
            : undefined
          index =
            Math.max(
              -1,
              ...accounts
                .filter((a) => a.walletId === account.walletId && a.crypto === account.crypto)
                .map((a) => a.index)
            ) + 1
          address =
            mnemonic && !address ? await getWalletAddress(mnemonic, account.crypto, index) : address
        }
        const newAccount = {
          ...account,
          address: address || '',
          index,
          createdAt: Date.now(),
          fav: false,
        }
        const encryptedAccountsString = CryptoJS.AES.encrypt(
          JSON.stringify([newAccount, ...(accounts || [])]),
          password
        ).toString()
        chrome.storage.local.set({ accounts: encryptedAccountsString }, () => {
          resolve(newAccount)
        })
      } catch (err) {
        reject(err)
      }
    })
  )

export const updateAccount = (
  password: string,
  address: string,
  account: Partial<Account>
): Promise<Account> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['accounts'], async (result) => {
      try {
        const accounts = await decryptStorage<Account[]>(result.accounts, password, [])
        let newAccount: Account
        const encryptedAccountsString = CryptoJS.AES.encrypt(
          JSON.stringify(
            accounts.map((a) => {
              if (a.address === address) {
                newAccount = { ...a, ...account }
                return newAccount
              }
              return a
            })
          ),
          password
        ).toString()
        chrome.storage.local.set({ accounts: encryptedAccountsString }, () => {
          resolve(newAccount)
        })
      } catch (err) {
        reject(err)
      }
    })
  )

export const deleteAccount = (password: string, address: string): Promise<{ success: boolean }> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['accounts'], async (result) => {
      try {
        const accounts = await decryptStorage<Account[]>(result.accounts, password, [])
        const filteredAccounts = accounts.filter((a) => a.address !== address)
        if (!filteredAccounts.length) {
          return chrome.storage.local.remove('accounts', () => {
            resolve({ success: true })
          })
        }
        const encryptedAccountsString = CryptoJS.AES.encrypt(
          JSON.stringify(filteredAccounts),
          password
        ).toString()
        return chrome.storage.local.set({ accounts: encryptedAccountsString }, () => {
          resolve({ success: true })
        })
      } catch (err) {
        return reject(err)
      }
    })
  )
