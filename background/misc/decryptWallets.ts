import CryptoJS from 'crypto-js'
import { Wallet } from '../../types'

const decryptWallets = (encryptedWalletsString: string, password: string): Wallet[] | null => {
  try {
    const wallets = JSON.parse(
      CryptoJS.AES.decrypt(encryptedWalletsString, password).toString(CryptoJS.enc.Utf8)
    )
    return wallets
  } catch (err) {
    return null
  }
}

export default decryptWallets
