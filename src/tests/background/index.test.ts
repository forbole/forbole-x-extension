import CryptoJS from 'crypto-js'
import { decryptWallets, handleMessages } from '../../../background'

const wallet = {
  id: '123',
  name: 'wallet',
  mnemonic: 'mnemonic',
  cryptos: ['ATOM'],
}
const password = '123123'
const encryptedWalletString = CryptoJS.AES.encrypt(JSON.stringify([wallet]), password).toString()

describe('background: decryptWallets', () => {
  it('decrypts encrypted wallets string and parse JSON', () => {
    const result = decryptWallets(encryptedWalletString, password)
    expect(result).toStrictEqual([wallet])
  })
  it('returns null when encrypted string is invalid', () => {
    const result = decryptWallets('invalid string', password)
    expect(result).toBe(null)
  })
})

describe('background: handleMessages', () => {
  it('handles ping for first time user', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({})
    })
    handleMessages({ event: 'ping' }, undefined, (result) => {
      expect(result).toStrictEqual({
        isFirstTimeUser: true,
      })
    })
  })
  it('handles ping for non first time user', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: '123123' })
    })
    handleMessages({ event: 'ping' }, undefined, (result) => {
      expect(result).toStrictEqual({
        isFirstTimeUser: false,
      })
    })
  })
  it('handles get wallets for correct password', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: encryptedWalletString })
    })
    handleMessages({ event: 'getWallets', data: { password } }, undefined, (result) => {
      const { mnemonic, ...walletToBeReturned } = wallet
      expect(result).toStrictEqual({
        wallets: [walletToBeReturned],
      })
    })
  })
  it('handles get wallets for incorrect password', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: encryptedWalletString })
    })
    handleMessages({ event: 'getWallets', data: { password: '123' } }, undefined, (result) => {
      expect(result).toStrictEqual({ err: 'incorrect password' })
    })
  })
  it('handles add wallet for correct password', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: encryptedWalletString })
    })
    handleMessages(
      {
        event: 'addWallet',
        data: {
          password,
          wallet: {
            name: 'new wallet',
            cryptos: ['ATOM'],
            mnemonic: 'new mnemonic',
            securityPassword: '321321',
          },
        },
      },
      undefined,
      (result) => {
        expect(result).toStrictEqual({
          wallet: {
            name: 'new wallet',
            id: CryptoJS.SHA256('new mnemonic').toString(),
            cryptos: ['ATOM'],
          },
        })
      }
    )
  })
  it('handles add wallet for incorrect password', () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: encryptedWalletString })
    })
    handleMessages(
      {
        event: 'addWallet',
        data: {
          password: '123',
          wallet: {
            name: 'new wallet',
            cryptos: ['ATOM'],
            mnemonic: 'new mnemonic',
            securityPassword: '321321',
          },
        },
      },
      undefined,
      (result) => {
        expect(result).toStrictEqual({ err: 'incorrect password' })
      }
    )
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
