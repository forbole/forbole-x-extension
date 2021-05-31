import { Secp256k1HdWallet } from '../../../@cosmjs/launchpad'
import { handleMessages } from '../../background'
import {
  addAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from '../../background/models/accounts'
import {
  addWallet,
  deleteWallet,
  getWallets,
  updateWallet,
  viewMnemonicPhrase,
} from '../../background/models/wallets'

const wallet = {
  id: '123',
  name: 'wallet',
  mnemonic: 'mnemonic',
  cryptos: ['ATOM'],
}
const account = {
  walletId: '123',
  name: 'account',
  address: 'address',
  crypto: 'ATOM',
  index: 0,
  fav: false,
}
const password = '123123'

const sendResponse = jest.fn()

jest.mock('../../background/wallets', () => ({
  addWallet: jest.fn(),
  deleteWallet: jest.fn(),
  getWallets: jest.fn(),
  updateWallet: jest.fn(),
  verifySecurityPassword: jest.fn(),
  viewMnemonicPhrase: jest.fn(),
}))

jest.mock('../../background/accounts', () => ({
  addAccount: jest.fn(),
  deleteAccount: jest.fn(),
  getAccounts: jest.fn(),
  updateAccount: jest.fn(),
}))

jest.mock('../../../@cosmjs/launchpad', () => ({
  Secp256k1HdWallet: {
    generate: jest.fn(),
    fromMnemonic: jest.fn(),
  },
}))

describe('background: handleMessages', () => {
  it('handles ping for first time user', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({})
    })
    await handleMessages({ event: 'ping' }, undefined, sendResponse)
    expect(sendResponse).toBeCalledWith({
      isFirstTimeUser: true,
    })
  })
  it('handles ping for non first time user', async () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementationOnce((items, callback) => {
      callback({ wallets: '123123' })
    })
    await handleMessages({ event: 'ping' }, undefined, sendResponse)
    expect(sendResponse).toBeCalledWith({
      isFirstTimeUser: false,
    })
  })
  it('handles get wallets', async () => {
    ;(getWallets as jest.Mock).mockResolvedValueOnce([])
    await handleMessages({ event: 'getWallets', data: { password } }, undefined, sendResponse)
    expect(getWallets).toBeCalledWith(password)
    expect(sendResponse).toBeCalledWith({
      wallets: [],
    })
  })
  it('handles get wallets with error', async () => {
    ;(getWallets as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages({ event: 'getWallets', data: { password } }, undefined, sendResponse)
    expect(getWallets).toBeCalledWith(password)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles add wallet', async () => {
    ;(addWallet as jest.Mock).mockResolvedValueOnce({ wallet, accounts: [] })
    await handleMessages(
      { event: 'addWallet', data: { password, wallet } },
      undefined,
      sendResponse
    )
    expect(addWallet).toBeCalledWith(password, wallet)
    expect(sendResponse).toBeCalledWith({
      wallet,
      accounts: [],
    })
  })
  it('handles add wallet with error', async () => {
    ;(addWallet as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'addWallet', data: { password, wallet } },
      undefined,
      sendResponse
    )
    expect(addWallet).toBeCalledWith(password, wallet)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles update wallet', async () => {
    ;(updateWallet as jest.Mock).mockResolvedValueOnce(wallet)
    await handleMessages(
      { event: 'updateWallet', data: { password, id: wallet.id, wallet } },
      undefined,
      sendResponse
    )
    expect(updateWallet).toBeCalledWith(password, wallet.id, wallet)
    expect(sendResponse).toBeCalledWith({
      wallet,
    })
  })
  it('handles update wallet with error', async () => {
    ;(updateWallet as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'updateWallet', data: { password, id: wallet.id, wallet } },
      undefined,
      sendResponse
    )
    expect(updateWallet).toBeCalledWith(password, wallet.id, wallet)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles delete wallet', async () => {
    ;(deleteWallet as jest.Mock).mockResolvedValueOnce({ success: true })
    await handleMessages(
      { event: 'deleteWallet', data: { password, id: wallet.id } },
      undefined,
      sendResponse
    )
    expect(deleteWallet).toBeCalledWith(password, wallet.id)
    expect(sendResponse).toBeCalledWith({ success: true })
  })
  it('handles delete wallet with error', async () => {
    ;(deleteWallet as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'deleteWallet', data: { password, id: wallet.id } },
      undefined,
      sendResponse
    )
    expect(deleteWallet).toBeCalledWith(password, wallet.id)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles get accounts', async () => {
    ;(getAccounts as jest.Mock).mockResolvedValueOnce([])
    await handleMessages({ event: 'getAccounts', data: { password } }, undefined, sendResponse)
    expect(getAccounts).toBeCalledWith(password)
    expect(sendResponse).toBeCalledWith({ accounts: [] })
  })
  it('handles get accounts with error', async () => {
    ;(getAccounts as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages({ event: 'getAccounts', data: { password } }, undefined, sendResponse)
    expect(getAccounts).toBeCalledWith(password)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles add account', async () => {
    ;(addAccount as jest.Mock).mockResolvedValueOnce(account)
    await handleMessages(
      { event: 'addAccount', data: { password, account, securityPassword: 'securityPassword' } },
      undefined,
      sendResponse
    )
    expect(addAccount).toBeCalledWith(password, account, 'securityPassword')
    expect(sendResponse).toBeCalledWith({ account })
  })
  it('handles add account with error', async () => {
    ;(addAccount as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'addAccount', data: { password, account, securityPassword: 'securityPassword' } },
      undefined,
      sendResponse
    )
    expect(addAccount).toBeCalledWith(password, account, 'securityPassword')
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles update account', async () => {
    ;(updateAccount as jest.Mock).mockResolvedValueOnce(account)
    await handleMessages(
      { event: 'updateAccount', data: { password, account, address: account.address } },
      undefined,
      sendResponse
    )
    expect(updateAccount).toBeCalledWith(password, account.address, account)
    expect(sendResponse).toBeCalledWith({ account })
  })
  it('handles update account with error', async () => {
    ;(updateAccount as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'updateAccount', data: { password, account, address: account.address } },
      undefined,
      sendResponse
    )
    expect(updateAccount).toBeCalledWith(password, account.address, account)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles delete account', async () => {
    ;(deleteAccount as jest.Mock).mockResolvedValueOnce({ success: true })
    await handleMessages(
      { event: 'deleteAccount', data: { password, address: account.address } },
      undefined,
      sendResponse
    )
    expect(deleteAccount).toBeCalledWith(password, account.address)
    expect(sendResponse).toBeCalledWith({ success: true })
  })
  it('handles delete wallet with error', async () => {
    ;(deleteAccount as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      { event: 'deleteAccount', data: { password, address: account.address } },
      undefined,
      sendResponse
    )
    expect(deleteAccount).toBeCalledWith(password, account.address)
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
  it('handles generate mnemonic', async () => {
    ;(Secp256k1HdWallet.generate as jest.Mock).mockResolvedValueOnce({ mnemonic: 'mnemonic' })
    await handleMessages({ event: 'generateMnemonic' }, undefined, sendResponse)
    expect(Secp256k1HdWallet.generate).toBeCalledWith(24)
    expect(sendResponse).toBeCalledWith({ mnemonic: 'mnemonic' })
  })
  it('handles verify mnemonic', async () => {
    ;(Secp256k1HdWallet.fromMnemonic as jest.Mock).mockResolvedValueOnce({ mnemonic: 'mnemonic' })
    await handleMessages(
      { event: 'verifyMnemonic', data: { mnemonic: 'mnemonic' } },
      undefined,
      sendResponse
    )
    expect(Secp256k1HdWallet.fromMnemonic).toBeCalledWith('mnemonic')
    expect(sendResponse).toBeCalledWith({ mnemonic: 'mnemonic' })
  })
  it('handles verify mnemonic with error', async () => {
    ;(Secp256k1HdWallet.fromMnemonic as jest.Mock).mockRejectedValueOnce(new Error())
    await handleMessages(
      { event: 'verifyMnemonic', data: { mnemonic: 'mnemonic' } },
      undefined,
      sendResponse
    )
    expect(Secp256k1HdWallet.fromMnemonic).toBeCalledWith('mnemonic')
    expect(sendResponse).toBeCalledWith({ err: 'invalid mnemonic' })
  })
  it('handles view mnemonic phrase', async () => {
    ;(viewMnemonicPhrase as jest.Mock).mockResolvedValueOnce('mnemonic')
    await handleMessages(
      {
        event: 'viewMnemonicPhrase',
        data: { password, id: wallet.id, securityPassword: 'securityPassword' },
      },
      undefined,
      sendResponse
    )
    expect(viewMnemonicPhrase).toBeCalledWith(password, wallet.id, 'securityPassword')
    expect(sendResponse).toBeCalledWith({ mnemonic: 'mnemonic' })
  })
  it('handles view mnemonic phrase with error', async () => {
    ;(viewMnemonicPhrase as jest.Mock).mockRejectedValueOnce(new Error('incorrect password'))
    await handleMessages(
      {
        event: 'viewMnemonicPhrase',
        data: { password, id: wallet.id, securityPassword: 'securityPassword' },
      },
      undefined,
      sendResponse
    )
    expect(viewMnemonicPhrase).toBeCalledWith(password, wallet.id, 'securityPassword')
    expect(sendResponse).toBeCalledWith({ err: 'incorrect password' })
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
