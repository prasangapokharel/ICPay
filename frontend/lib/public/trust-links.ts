import {
  BACKEND_CANISTER_ID,
  FRONTEND_CANISTER_ID,
  ICP_LEDGER_CANISTER_ID,
} from "@/lib/ic/constants"

export const ICPAY_CANISTERS = {
  backend: BACKEND_CANISTER_ID,
  frontend: FRONTEND_CANISTER_ID,
  icpLedger: ICP_LEDGER_CANISTER_ID,
} as const

export const ICPAY_SOCIAL_LINKS = {
  github: "https://github.com/prasangapokharel/ICPay",
  x: "https://x.com/IcpayOfficial",
  linkedin: "https://www.linkedin.com/company/icpayofficial",
  discord: "https://discord.gg/icpay",
} as const

export type TrustLinkDef = {
  id: string
  href: string
  external?: boolean
}

export const TRUST_LINK_DEFS: TrustLinkDef[] = [
  { id: "github", href: ICPAY_SOCIAL_LINKS.github, external: true },
  {
    id: "backendCanister",
    href: `https://dashboard.internetcomputer.org/canister/${ICPAY_CANISTERS.backend}`,
    external: true,
  },
  { id: "transparency", href: "/transparency" },
  { id: "x", href: ICPAY_SOCIAL_LINKS.x, external: true },
  { id: "linkedin", href: ICPAY_SOCIAL_LINKS.linkedin, external: true },
  {
    id: "frontendCanister",
    href: `https://${ICPAY_CANISTERS.frontend}.icp0.io`,
    external: true,
  },
]

export const HOW_IT_WORKS_STEP_DEFS = [
  { id: "signIn" },
  { id: "claimUsername" },
  { id: "shareLink" },
  { id: "sendByUsername" },
  { id: "trackTransfers" },
  { id: "fullStack" },
] as const
