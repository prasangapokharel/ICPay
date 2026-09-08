export const images = {
  connectBg: require('../../assets/images/connectbg/1.png'),
  logo: require('../../assets/images/logo/logo.png'),
  icpayToken: require('../../assets/images/logo/icpay/token.png'),
  presaleBg: require('../../assets/images/presale/bg.svg'),
} as const

export const actionIcons = {
  send: require('../../assets/Icons8/arrow/icons8-circled-up-right-48.png'),
  deposit: require('../../assets/Icons8/arrow/icons8-circled-down-left-48.png'),
  swap: require('../../assets/Icons8/icons8-dividends-48.png'),
} as const

export const authIcons = {
  google: require('../../assets/images/auth/google-icon.svg'),
  apple: require('../../assets/images/auth/apple.svg'),
  microsoft: require('../../assets/images/auth/microsoft-icon.svg'),
} as const

export type OpenIdProvider = keyof typeof authIcons

export const DERIVATION_ORIGIN = 'https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io'
export const WALLET_CANISTER_ID = '6vbhm-nqaaa-aaaan-q6muq-cai'
export const IC_HOST = 'https://icp0.io'
export const II_URL = 'https://id.ai'
export const NFID_PROVIDER =
  'https://nfid.one/authenticate/?applicationName=ICPay#authorize'
