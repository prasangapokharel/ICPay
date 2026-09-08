/** Desktop wallet installers — served from GitHub Releases, not Vercel public/. */
const RELEASE_BASE =
  "https://github.com/prasangapokharel/ICPay/releases/latest/download"

export const DESKTOP_DOWNLOADS = {
  windows: `${RELEASE_BASE}/icpay-wallet-setup.exe`,
  linuxRpm: `${RELEASE_BASE}/icpay-wallet-linux.rpm`,
  linuxDeb: `${RELEASE_BASE}/icpay-wallet-linux.deb`,
} as const
