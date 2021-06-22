import CryptoJS from 'crypto-js'
import decryptStorage from '../../background/misc/decryptStorage'
import decryptMnemonic from '../../background/misc/decryptMnemonic'
import {
  getWallets,
  deleteWallet,
  addWallet,
  updateWallet,
  viewMnemonicPhrase,
  viewMnemonicPhraseBackup,
} from '../../background/models/wallets'
import { addAccount } from '../../background/models/accounts'
import { CreateWalletParams } from '../../../types'

const account = {
  walletId: '123',
  name: 'account',
  address: 'address',
  crypto: 'ATOM',
  index: 0,
  fav: false,
}

const wallet = {
  id: '123',
  name: 'wallet',
  mnemonic: 'mnemonic',
  cryptos: ['ATOM'],
  createdAt: 123,
}

const password = '123123'

jest.mock('../../background/misc/decryptStorage')
jest.mock('../../background/misc/decryptMnemonic')
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(),
  },
  SHA256: jest.fn(),
}))
jest.mock('../../background/accounts', () => ({
  addAccount: jest.fn(),
}))

describe('background: wallets', () => {
  it('handles get wallets', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockImplementationOnce((a) => Promise.resolve(a))
    const wallets = await getWallets(password)
    expect(wallets).toStrictEqual([
      {
        id: wallet.id,
        name: wallet.name,
        createdAt: wallet.createdAt,
      },
    ])
  })
  it('handles get wallets with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await getWallets(password)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles add wallet', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementationOnce((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementation((a) => a)
    ;(CryptoJS.SHA256 as jest.Mock).mockImplementationOnce((a) => `hashed-${a}`)
    jest.spyOn(Date, 'now').mockReturnValueOnce(123)
    ;(addAccount as jest.Mock).mockResolvedValueOnce(account)
    const newWallet: CreateWalletParams = {
      name: 'wallet 2',
      type: 'mnemonic',
      mnemonic: 'mnemonic 2',
      securityPassword: '123123',
      cryptos: ['DSM'],
      addresses: [account.address],
    }
    const result = await addWallet(password, newWallet)
    expect(result).toStrictEqual({
      wallet: {
        name: newWallet.name,
        id: 'hashed-mnemonic 2',
        createdAt: 123,
      },
      accounts: [account],
    })
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        wallets: JSON.stringify([
          {
            name: newWallet.name,
            mnemonic: newWallet.mnemonic,
            id: 'hashed-mnemonic 2',
            createdAt: 123,
          },
          wallet,
        ]),
      },
      expect.any(Function)
    )
  })
  it('handles add wallet with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    const newWallet: CreateWalletParams = {
      name: 'wallet 2',
      type: 'mnemonic',
      mnemonic: 'mnemonic 2',
      securityPassword: '123123',
      cryptos: ['DSM'],
      addresses: [account.address],
    }
    try {
      await addWallet(password, newWallet)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles update wallet name', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementationOnce((a) => a)
    const newWallet = await updateWallet(password, wallet.id, { name: 'new name' })
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        wallets: JSON.stringify([{ ...wallet, name: 'new name' }]),
      },
      expect.any(Function)
    )
    expect(newWallet).toStrictEqual({
      createdAt: wallet.createdAt,
      id: wallet.id,
      name: 'new name',
    })
  })
  it('handles update wallet security password', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementation((a) => a)
    const newWallet = await updateWallet(password, wallet.id, {
      securityPassword: '123123',
      newSecurityPassword: '321321',
    })
    expect(CryptoJS.AES.encrypt).toBeCalledWith(wallet.mnemonic, '321321')
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        wallets: JSON.stringify([wallet]),
      },
      expect.any(Function)
    )
    expect(newWallet).toStrictEqual({
      createdAt: wallet.createdAt,
      id: wallet.id,
      name: wallet.name,
    })
  })
  it('handles update wallet with incorrect id', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    try {
      await updateWallet(password, 'new id', {
        securityPassword: '123123',
        newSecurityPassword: '321321',
      })
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('wallet not found'))
    }
  })
  it('handles update wallet with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await updateWallet(password, account.address, { name: 'new name' })
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles delete account', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({
        accounts: [account, { ...account, walletId: '321' }],
        wallets: [wallet, { ...wallet, id: '321' }],
      })
    })
    ;(chrome.storage.local.set as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementation((a) => a)

    const result = await deleteWallet(password, '321')
    expect(chrome.storage.local.set).toBeCalledWith(
      {
        accounts: JSON.stringify([account]),
        wallets: JSON.stringify([wallet]),
      },
      expect.any(Function)
    )
    expect(result).toStrictEqual({ success: true })
  })
  it('handles delete account with no wallet left', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(chrome.storage.local.remove as jest.Mock).mockImplementationOnce((items, callback) => {
      callback()
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementation((a) => a)

    const result = await deleteWallet(password, wallet.id)
    expect(chrome.storage.local.remove).toBeCalledWith(
      ['wallets', 'accounts'],
      expect.any(Function)
    )
    expect(result).toStrictEqual({ success: true })
  })
  it('handles delete account with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await deleteWallet(password, wallet.id)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles view mnemonic phrase', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    const mnemonic = await viewMnemonicPhrase(password, wallet.id, '123123')
    expect(decryptMnemonic).toBeCalledWith(wallet.mnemonic, '123123')
    expect(mnemonic).toBe('mnemonic')
  })
  it('handles view mnemonic phrase with incorrect wallet id', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    try {
      await viewMnemonicPhrase(password, 'new id', '123123')
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('wallet not found'))
    }
  })
  it('handles view mnemonic phrase with error', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    try {
      await viewMnemonicPhrase(password, 'new id', '123123')
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('handles view mnemonic phrase backup', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ accounts: [account], wallets: [wallet] })
    })
    ;(decryptStorage as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(decryptMnemonic as jest.Mock).mockImplementation((a) => Promise.resolve(a))
    ;(CryptoJS.AES.encrypt as jest.Mock).mockImplementation((a) => a)
    const mnemonic = await viewMnemonicPhraseBackup(password, wallet.id, '123123', '123123123')
    expect(CryptoJS.AES.encrypt).toBeCalledWith('mnemonic', '123123123')
    expect(mnemonic).toBe('mnemonic')
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
