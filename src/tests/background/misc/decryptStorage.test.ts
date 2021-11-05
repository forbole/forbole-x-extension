import CryptoJS from 'crypto-js'
import decryptStorage from '../../../background/misc/decryptStorage'

jest.mock('crypto-js', () => ({
  AES: {
    decrypt: jest.fn(),
  },
  enc: {
    Utf8: 'Utf8',
  },
}))

describe('background: misc - decryptStorage', () => {
  it('decrypts an encrypted storage string', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce((a) => `{ "a": "${a}" }`)
    const result = await decryptStorage('storage', '123123')
    expect(result).toStrictEqual({ a: 'storage' })
  })
  it('throws an error if result is not valid JSON', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce((a) => a)
    try {
      await decryptStorage('storage', '123123')
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err).toStrictEqual(new Error('incorrect password'))
    }
  })
  it('returns default value if CryptoJS.AES.decrypt throws an error', async () => {
    ;(CryptoJS.AES.decrypt as jest.Mock).mockImplementationOnce((a) => a)
    const result = await decryptStorage('storage', '123123', {})
    expect(result).toStrictEqual({})
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
