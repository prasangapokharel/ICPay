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
    summary: "See every ICRC-1 holding, with live balances and metadata.",
    status: "shipped",
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
        done: true,
        note: "Arrived in Phase 3, once the ledger client stopped being pinned to the ICP ledger canister ID.",
      },
    ],
    doneWhen: "Shipped.",
  },
  {
    id: "tokens-move",
    index: 3,
    title: "Multi-token transfers",
    summary: "Every token on screen moves, by username, at its own decimals.",
    status: "shipped",
    icon: ArrowDataTransferHorizontalIcon,
    dependsOn: ["Phase 2"],
    milestones: [
      { label: "Generalize the ledger client to any ICRC-1 canister", done: true },
      {
        label: "Per-token fees read live from metadata",
        done: true,
        note: "ICP's fee is a fixed constant. Every other ICRC-1 token declares its own, and it can change, so icrc1_fee is called per transfer and never cached.",
      },
      {
        label: "Per-token decimals",
        done: true,
        note: "ICP is 8 decimals, ckUSDC is 6, ckETH is 18. Amounts are parsed and formatted on the digit string, because float math cannot hold 18 places.",
      },
      { label: "Per-token deposit and withdraw", done: true },
      {
        label: "Ledger allowlist",
        done: true,
        note: "An arbitrary ledger canister ID would let a user send to a contract that traps or lies. Chain-key plus verified SNS only; opening it up needs a verification story first.",
      },
    ],
    risks: [
      "The allowlist is what makes this safe. A fake USDC on an open field is the failure mode.",
      "More tokens means more balance queries. Queries are free on the IC, so the cost is latency, not cycles.",
    ],
    doneWhen: "Shipped.",
  },
  {
    id: "create-token",
    index: 4,
    title: "Token creation",
    summary: "Launch a token from the wallet without touching dfx.",
    status: "shipped",
    icon: PlusSignCircleIcon,
    dependsOn: ["Phase 3"],
    milestones: [
      {
        label: "Deploy the audited reference ledger wasm",
        done: true,
        note: "The reference wasm is uploaded in chunks and sealed against a module hash before any launch can use it. No ledger was written for this — a hand-rolled ledger holding real value is the single worst idea available here.",
      },
      { label: "Launch form — name, symbol, supply, logo, socials", done: true },
      {
        label: "Nobody controls the ledger, not even the creator",
        done: true,
        note: "Every launch ends with controllers = [], so the ledger can never be upgraded or reinstalled by anyone. The plan was to hand control to the creator, but a creator who can upgrade their own ledger can rewrite the supply rules after people buy in. The freezing threshold is set to a year to compensate, since with no controller there is no reinstall after deletion.",
      },
      {
        label: "A flat 5 ICP fee covers the cycles",
        done: true,
        note: "The plan had the creator supplying their own cycles. That would have put dfx back in the flow, which is the thing this phase set out to remove, so ICPay converts part of the fee instead.",
      },
      {
        label: "Fixed decimals and transfer fee",
        done: true,
        note: "8 decimals and a 10,000 e8s fee for every launch. A creator choosing 0 decimals or a zero fee produces a token that behaves surprisingly everywhere else in the wallet.",
      },
      {
        label: "Launched tokens are sendable by username immediately",
        done: true,
        note: "Each new ledger is registered on the transfer allowlist at launch, so it works with the Phase 3 send flow without a manual step.",
      },
      {
        label: "Supply is fixed by construction",
        done: true,
        note: "The minting account is set to aaaaa-aa, the management canister, which has no caller — so in ICRC-1 terms nothing can ever mint. ICPAY itself launched before this fix and is the one exception; its /icpay page reads the minting account from the ledger and shows it rather than claiming either way.",
      },
    ],
    risks: [
      "The 5 ICP fee is the crude anti-spam fix. A reputation gate needs Phase 7's identity work.",
      "Symbols are reserved once here, but that does nothing about a token impersonating one launched elsewhere. The ledger canister ID is shown alongside.",
    ],
    doneWhen: "Shipped.",
  },
  {
    id: "trade",
    index: 5,
    title: "Liquidity and on-chain trading",
    summary: "Swap, then pay a handle, in one flow.",
    status: "next",
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
