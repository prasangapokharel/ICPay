import type { IconSvgElement } from "@hugeicons/react"
import {
  ShieldKeyIcon,
  UserIcon,
  Coins01Icon,
  ArrowDataTransferHorizontalIcon,
  PlusSignCircleIcon,
  ChartLineData01Icon,
  LockKeyIcon,
  Store01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"

export type PhaseStatus = "shipped" | "active" | "next" | "planned"

export type Milestone = {
  label: string
  done: boolean
  // Surfaced in a popover. Only worth writing when the reason is non-obvious.
  note?: string
}

export type Phase = {
  id: string
  index: number
  title: string
  summary: string
  status: PhaseStatus
  icon: IconSvgElement
  milestones: Milestone[]
  dependsOn?: string[]
  risks?: string[]
  doneWhen?: string
}

export const STATUS_META: Record<
  PhaseStatus,
  { label: string; badge: "default" | "secondary" | "outline" | "destructive"; dot: string }
> = {
  shipped: { label: "Shipped", badge: "default", dot: "bg-primary" },
  active: { label: "In progress", badge: "secondary", dot: "bg-primary/60" },
  next: { label: "Next", badge: "outline", dot: "bg-muted-foreground/50" },
  planned: { label: "Planned", badge: "outline", dot: "bg-muted-foreground/25" },
}

// Single source of truth. Adding a phase is one object -- the stepper, the
// chart and the progress ring all derive from this array.
export const PHASES: Phase[] = [
  {
    id: "custody",
    index: 0,
    title: "Custody foundation",
    summary: "Per-user subaccounts, and no path by which one user moves another's funds.",
    status: "shipped",
    icon: ShieldKeyIcon,
    milestones: [
      {
        label: "Deterministic per-user subaccount",
        done: true,
        note: "Derived from a length-prefixed principal, so the same user always resolves to the same deposit address. Nothing is stored, so nothing can drift.",
      },
      {
        label: "from_subaccount always derived from caller",
        done: true,
        note: "Never accepted as an argument. This single property is why a crafted request cannot drain someone else's account.",
      },
      {
        label: "Admin cannot touch balances",
        done: true,
        note: "The entire admin surface is username reserve and release. There is no endpoint that moves funds.",
      },
      { label: "Stable memory survives upgrades", done: true },
      { label: "24-test suite", done: true },
    ],
    doneWhen: "Shipped. Every later phase stands on this.",
  },
  {
    id: "username",
    index: 1,
    title: "Username as the address",
    summary: "Send to @handle instead of a 63-character principal.",
    status: "shipped",
    icon: UserIcon,
    milestones: [
      {
        label: "Claim 5–8 characters free",
        done: true,
        note: "Two pricing rules coexist and both are real: 5–8 characters are free to claim, and any length can be bought. That is why a 5-character handle can show a price and still be correct.",
      },
      { label: "Buy 1–4 characters — 10 / 5 / 2 / 1 ICP", done: true },
      {
        label: "Old handles resolve forever",
        done: true,
        note: "Changing a username adds a mapping without removing the old one, so an address printed on a card or posted in a bio keeps working.",
      },
      { label: "Four send formats", done: true },
      {
        label: "Public profile at /@handle",
        done: true,
        note: "The lookup is unauthenticated on purpose. Requiring a login to view a profile would make an ICPay link useless in a bio.",
      },
    ],
    doneWhen: "Shipped.",
  },
  {
    id: "tokens-view",
    index: 2,
    title: "Multi-token visibility",
    summary: "See every ICRC-1 holding. ICP is still the only one that moves.",
    status: "active",
    icon: Coins01Icon,
    milestones: [
      { label: "Discover SNS ledgers from SNS-W", done: true },
      {
        label: "Add the five chain-key ledgers",
        done: true,
        note: "ckBTC, ckETH, ckUSDC and ckUSDT are not SNS-launched, so the SNS registry does not list them. They are added explicitly.",
      },
      { label: "Balances and metadata per token", done: true },
      { label: "Live ICP price for fiat display", done: true },
      {
        label: "Send and receive non-ICP tokens",
        done: false,
        note: "The backend ledger client is bound to the ICP ledger canister ID, so other tokens can be read but not moved. Generalizing it is the next phase.",
      },
    ],
    doneWhen: "Balances are live. Transfers are not — that is Phase 3.",
  },
  {
    id: "tokens-move",
    index: 3,
    title: "Multi-token transfers",
    summary: "Make the tokens already on screen actually movable.",
    status: "next",
    icon: ArrowDataTransferHorizontalIcon,
    dependsOn: ["Phase 2"],
    milestones: [
      { label: "Generalize the ledger client to any ICRC-1 canister", done: false },
      {
        label: "Per-token fees read live from metadata",
        done: false,
        note: "ICP's fee is a fixed constant. Every other ICRC-1 token declares its own, and it can change. Caching it will eventually eat a transfer with a BadFee error.",
      },
      {
        label: "Per-token decimals",
        done: false,
        note: "ICP is 8 decimals, ckUSDC is 6. Formatting cannot be shared, and getting it wrong misprices a transfer by 100×.",
      },
      { label: "Per-token deposit and withdraw", done: false },
      {
        label: "Ledger allowlist",
        done: false,
        note: "An arbitrary ledger canister ID would let a user send to a contract that traps or lies. Chain-key plus verified SNS first; open it up only when there is a reason.",
      },
    ],
    risks: [
      "A malicious ledger canister can trap or misreport. Ship an allowlist before an open field.",
      "More tokens means more balance queries. Queries are free on the IC, so the cost is latency, not cycles.",
    ],
    doneWhen: "A user sends ckUSDC to @handle and the fee came from live metadata, not a constant.",
  },
  {
    id: "create-token",
    index: 4,
    title: "Token creation",
    summary: "Launch a token from the wallet without touching dfx.",
    status: "planned",
    icon: PlusSignCircleIcon,
    dependsOn: ["Phase 3"],
    milestones: [
      {
        label: "Deploy the audited reference ledger wasm",
        done: false,
        note: "Do not write a new ledger. A hand-rolled ledger holding real value is the single worst idea available here.",
      },
      { label: "Launch form — name, symbol, decimals, supply, fee", done: false },
      {
        label: "Creator controls their own ledger",
        done: false,
        note: "If ICPay were the controller it would own every token ever launched here — a liability, and a lie about who is in control.",
      },
      {
        label: "Creator pays their own cycles",
        done: false,
        note: "A ledger canister is not free to run, and ICPay cannot subsidize an unbounded number of them.",
      },
      { label: "Auto-list on the creator's profile", done: false },
    ],
    risks: [
      "A free launch button produces a thousand scam tokens impersonating real ones.",
      "Two tokens can share a symbol. Show the ledger canister ID next to anything unverified.",
    ],
    doneWhen: "A launched token sends between two handles with correct symbol and decimals — and ICPay controls nothing.",
  },
  {
    id: "trade",
    index: 5,
    title: "Liquidity and on-chain trading",
    summary: "Swap, then pay a handle, in one flow.",
    status: "planned",
    icon: ChartLineData01Icon,
    dependsOn: ["Phase 3", "Phase 4"],
    milestones: [
      {
        label: "Integrate an existing ICP DEX",
        done: false,
        note: "An AMM is a small amount of arithmetic wrapped in an enormous amount of adversarial risk — rounding that favours the attacker, sandwiching, first-depositor share inflation. None of it is our differentiator. Borrow the pool; build the flow.",
      },
      {
        label: "ICRC-2 approve and transfer_from",
        done: false,
        note: "The standard DEX entry path. The backend does not implement ICRC-2 at all today.",
      },
      {
        label: "Slippage enforced on-chain",
        done: false,
        note: "A slippage check that only runs in the browser is decoration.",
      },
      { label: "Quote preview with price impact", done: false },
      {
        label: "Impermanent-loss warning",
        done: false,
        note: "Most people supplying a volatile pair do not know what they are agreeing to.",
      },
    ],
    risks: [
      "A trap between approve and swap can strand an approval. Every path needs an explicit failure story.",
      "Front-running is smaller on the IC than on Ethereum, but it is not zero. Do not claim it is impossible.",
    ],
    doneWhen: "A failed swap leaves no stranded approval.",
  },
  {
    id: "decentralize",
    index: 6,
    title: "Decentralizing custody",
    summary: "Stop one key being able to change the rules.",
    status: "planned",
    icon: LockKeyIcon,
    milestones: [
      {
        label: "Controller moves to SNS or NNS",
        done: false,
        note: "Today one controller principal can upgrade the canister, and therefore rewrite the rules that protect user funds. An upgrade should be a proposal and a vote.",
      },
      {
        label: "Reproducible builds",
        done: false,
        note: "Without a pinned toolchain and a published hash, 'auditable on-chain code' means 'auditable if you trust that the source matches the wasm'.",
      },
      { label: "Third-party security audit", done: false },
      {
        label: "Private disclosure channel",
        done: false,
        note: "The only route today is a public GitHub issue, which asks a researcher to publish a live vulnerability.",
      },
      { label: "Published incident policy", done: false },
    ],
    doneWhen: "No single person can change what the canister does.",
  },
  {
    id: "merchant",
    index: 7,
    title: "Merchants and payments",
    summary: "Payment requests, settlement, refunds as first-class objects.",
    status: "planned",
    icon: Store01Icon,
    dependsOn: ["Phase 3", "Phase 6"],
    milestones: [
      {
        label: "Merchant accounts",
        done: false,
        note: "A merchant holding revenue needs stronger custody guarantees than a hobbyist holding pocket change — which is why this waits on Phase 6.",
      },
      {
        label: "Signed, expiring payment requests",
        done: false,
        note: "Single-use and verifiable by the merchant without trusting a customer's screenshot.",
      },
      { label: "Webhook or polling settlement API", done: false },
      {
        label: "Refunds linked to the original transaction",
        done: false,
        note: "Not a manual reverse transfer that nobody can reconcile at month end.",
      },
      { label: "Settlement reports and CSV export", done: false },
    ],
    risks: [
      "Chargebacks do not exist. On-chain settlement is final — the checkout copy has to say so rather than implying card-like protection.",
      "Taking payment for real goods invites KYC/AML duties that vary by jurisdiction. A lawyer question, not a code one.",
      "Nobody prices a coffee in a volatile asset, so this needs stablecoins first.",
    ],
    doneWhen: "A shop reconciles a day of ICPay revenue without opening a block explorer.",
  },
  {
    id: "shop",
    index: 8,
    title: "Shopping",
    summary: "A merchant directory, listings, and orders in the wallet.",
    status: "planned",
    icon: ShoppingBag01Icon,
    dependsOn: ["Phase 7"],
    milestones: [
      { label: "Browsable merchant directory", done: false },
      { label: "Listings with on-chain price and inventory", done: false },
      { label: "Orders alongside transactions", done: false },
      {
        label: "Optional escrow",
        done: false,
        note: "The hard part is not code. Escrow needs a dispute resolver, and a resolver is either a trusted party or a vote — centralized, or gameable. Ship without it, learn the real failure mode, then design for that.",
      },
    ],
    doneWhen: "Deliberately vague. This is the most speculative item here and most likely to change shape.",
  },
]

// Not on the roadmap, and saying so is part of having one.
export const NOT_DOING: { title: string; why: string }[] = [
  {
    title: "Non-custodial mode",
    why: "A real improvement, and a different product. Retrofitting it means rebuilding every flow.",
  },
  {
    title: "Native mobile apps",
    why: "The PWA covers it. Two more build targets is not worth it yet.",
  },
  {
    title: "Cross-chain bridges",
    why: "Chain-key tokens already give BTC, ETH and stables natively. A bridge is the most-exploited component in the industry, and here it would be redundant.",
  },
  {
    title: "NFTs",
    why: "No clear tie to sending money by username.",
  },
  {
    title: "Fiat on-ramp",
    why: "Wanted, but it needs a licensed partner. Revisit with the merchant compliance work.",
  },
]

export function phaseProgress(phase: Phase): number {
  const done = phase.milestones.filter((m) => m.done).length
  return Math.round((done / phase.milestones.length) * 100)
}

export function overallProgress(): number {
  const all = PHASES.flatMap((p) => p.milestones)
  return Math.round((all.filter((m) => m.done).length / all.length) * 100)
}
