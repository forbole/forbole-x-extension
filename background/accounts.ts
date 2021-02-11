import CryptoJS from 'crypto-js'
import decryptStorage from './misc/decryptStorage'
import { Account } from '../types'

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
  account: Omit<Account, 'createdAt'>
): Promise<Account> =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(['accounts'], async (result) => {
      try {
        const accounts = await decryptStorage<Account[]>(result.accounts, password, [])
        const newAccount = { ...account, createdAt: Date.now() }
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
