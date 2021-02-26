import getWalletAddress from '../../../background/misc/getWalletAddress'

const mnemonic =
  'olive praise state suggest leader scan weekend exhibit glance gravity rebel kingdom'
const address = 'cosmos1evclzwf4yrtjq8y4zpsaa5u6zu5hzu0m7t6m0f'

describe('background: misc - getWalletAddress', () => {
  it('returns wallet address', async () => {
    const result = await getWalletAddress(mnemonic, 'ATOM', 0)
    expect(result).toStrictEqual(address)
  })
  it('throws an error if mnemonic is invalid', async () => {
    try {
      await getWalletAddress(`${mnemonic}123`, 'ATOM', 0)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toStrictEqual(new Error('Invalid mnemonic format'))
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
