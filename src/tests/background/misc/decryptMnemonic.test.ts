import CryptoJS from 'crypto-js'
import decryptMnemonic from '../../../background/misc/decryptMnemonic'

jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(),
  },
  enc: {
    Utf8: 'Utf8',
  },
}))

describe('background: misc - decryptMnemonic', () => {
  it('decrypts a mnemonic phrase', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce((a) => `decrypted-${a}`)
    const mnemonic = await decryptMnemonic('mnemonic', '123123')
    expect(mnemonic).toBe('decrypted-mnemonic')
  })
  it('throws an error if mnemonic is falsy', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce((a) => '')
    try {
      await decryptMnemonic('mnemonic', '123123')
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('throws an error if CryptoJS.AES.decrypt throws an error', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce(() => {
      throw new Error()
    })
    try {
      await decryptMnemonic('mnemonic', '123123')
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
