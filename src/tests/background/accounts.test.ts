import CryptoJS from 'crypto-js'
import decryptStorage from '../../background/misc/decryptStorage'
import getWalletAddress from '../../background/misc/getWalletAddress'
import decryptMnemonic from '../../background/misc/decryptMnemonic'
import {
  addAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from '../../background/models/accounts'
import { CreateAccountParams } from '../../../types'

const account = {
  walletId: '123',
  name: 'account',
  address: 'address',
  crypto: 'DSM',
  index: 0,
  fav: false,
}

const wallet = {
  id: '123',
  name: 'wallet',
  mnemonic: 'mnemonic',
  cryptos: ['DSM'],
}

const password = '123123'

jest.mock('../../background/misc/decryptStorage')
jest.mock('../../background/misc/decryptMnemonic')
jest.mock('../../background/misc/getWalletAddress')
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(),
  },
}))

describe('background: accounts', () => {
  it('handles get accounts', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account] })
    })
    ;(decryptStorage as jest.Mock).mockImplementationOnce((a) => Promise.resolve(a))
    const accounts = await getAccounts(password)
    expect(accounts).toStrictEqual([account])
  })
  it('handles get accounts with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await getAccounts(password)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles add account with address', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementationOnce((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    jest.spyOn(Date, 'now').mockReturnValue(123)
    const newAccount: CreateAccountParams = {
      walletId: '123',
      name: 'new wallet',
      crypto: 'DSM',
      address: 'new address',
      index: 1,
    }
    const acc = await addAccount(password, newAccount, password)
    expect(acc).toStrictEqual({ ...newAccount, fav: false, createdAt: 123 })
    expect(chrome.storage.local.set).toBeCalledWith(
      { accounts: JSON.stringify([acc, account]) },
      expect.any(Function)
    )
  })
  it('handles add account without address', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    jest.spyOn(Date, 'now').mockReturnValueOnce(123)
    ;(getWalletAddress as jest.Mock).mockResolvedValueOnce('mock address')
    const newAccount: CreateAccountParams = {
      walletId: '123',
      name: 'new wallet',
      crypto: 'DSM',
    }
    const acc = await addAccount(password, newAccount, password)
    expect(acc).toStrictEqual({
      ...newAccount,
      address: 'mock address',
      index: 1,
      fav: false,
      createdAt: 123,
    })
    expect(chrome.storage.local.set).toBeCalledWith(
      { accounts: JSON.stringify([acc, account]) },
      expect.any(Function)
    )
  })
  it('handles add accounts with incorrect walletId', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    jest.spyOn(Date, 'now').mockReturnValueOnce(123)
    ;(getWalletAddress as jest.Mock).mockResolvedValueOnce('mock address')
    const newAccount: CreateAccountParams = {
      walletId: '123123',
      name: 'new wallet',
      crypto: 'DSM',
    }
    try {
      await addAccount(password, newAccount, password)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('wallet not found'))
    }
  })
  it('handles add accounts with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    const newAccount: CreateAccountParams = {
      walletId: '123',
      name: 'new wallet',
      crypto: 'DSM',
      address: 'new address',
      index: 1,
    }
    try {
      await addAccount(password, newAccount, password)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles update account', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    const acc = await updateAccount(password, account.address, { name: 'new name' })
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        accounts: JSON.stringify([{ ...account, name: 'new name' }]),
      },
      expect.any(Function)
    )
    expect(acc).toStrictEqual({ ...account, name: 'new name' })
  })
  it('handles update account with incorrect address', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    const acc = await updateAccount(password, 'new address', { name: 'new name' })
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        accounts: JSON.stringify([account]),
      },
      expect.any(Function)
    )
    expect(acc).toBe(undefined)
  })
  it('handles update account with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await updateAccount(password, account.address, { name: 'new name' })
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles delete account', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account, { ...account, address: 'new address' }], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)

    const result = await deleteAccount(password, 'new address')
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        accounts: JSON.stringify([account]),
      },
      expect.any(Function)
    )
    expect(result).toStrictEqual({ success: true })
  })
  it('handles delete account with no account left', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.remove as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)

    const result = await deleteAccount(password, account.address)
    expect(chrome.storage.local.remove).toBeCalledWith('accounts', expect.any(Function))
    expect(result).toStrictEqual({ success: true })
  })
  it('handles delete account with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await deleteAccount(password, account.address)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
