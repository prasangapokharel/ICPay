export const ICPAY_CANISTERS = {
  backend: "6vbhm-nqaaa-aaaan-q6muq-cai",
  frontend: "63dke-waaaa-aaaan-q6mvq-cai",
  icpLedger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
} as const

export type TrustLink = {
  label: string
  href: string
  description: string
  external?: boolean
}

export const ICPAY_SOCIAL_LINKS = {
  github: "https://github.com/prasangapokharel/ICPay",
  x: "https://x.com/IcpayOfficial",
  linkedin: "https://www.linkedin.com/company/icpayofficial",
  discord: "https://discord.gg/icpay",
} as const

export const TRUST_LINKS: TrustLink[] = [
  {
    label: "Open source on GitHub",
    href: ICPAY_SOCIAL_LINKS.github,
    description:
      "Backend Motoko and the Next.js frontend are public. Inspect fund movement, auth, and upgrade paths yourself.",
    external: true,
  },
  {
    label: "Mainnet backend canister",
    href: `https://dashboard.internetcomputer.org/canister/${ICPAY_CANISTERS.backend}`,
    description: `Wallet logic runs at ${ICPAY_CANISTERS.backend} on Internet Computer mainnet.`,
    external: true,
  },
  {
    label: "Transparency page",
    href: "/transparency",
    description:
      "Published custody model, fees, and what the operator can and cannot do — with on-chain addresses to verify.",
  },
  {
    label: "X / Twitter",
    href: ICPAY_SOCIAL_LINKS.x,
    description: "Product updates, launches, and Internet Computer ecosystem news from @IcpayOfficial.",
    external: true,
  },
  {
    label: "LinkedIn",
    href: ICPAY_SOCIAL_LINKS.linkedin,
    description: "Company updates and team posts from the official ICPay LinkedIn page.",
    external: true,
  },
  {
    label: "On-chain frontend",
    href: `https://${ICPAY_CANISTERS.frontend}.icp0.io`,
    description: `Static assets and II derivation origin served from ${ICPAY_CANISTERS.frontend}.`,
    external: true,
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Sign in with Internet Identity",
    body: "Use a passkey or linked account. No password notebook and no seed phrase to lose.",
  },
  {
    title: "Claim your @username",
    body: "Pick a handle once. People pay you at icpay.app/yourname instead of a 63-character principal.",
  },
  {
    title: "Share your link or address",
    body: "Send your username page or deposit address to anyone who needs to pay you in ICP.",
  },
  {
    title: "Send by @username",
    body: "Transfer ICP in seconds. Type a handle, confirm the amount, and the ledger records it on-chain.",
  },
  {
    title: "Track every transfer",
    body: "Balances and history tie to the official ICP ledger. Open any transaction on the block explorer.",
  },
  {
    title: "Use the full stack",
    body: "Channels for community, ICBucket for on-chain files, and ICFalcon for Motoko development — same ecosystem.",
  },
] as const
