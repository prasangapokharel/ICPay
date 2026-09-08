export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  category?: string
}

/** Public URL for a blog article — always under /blog/{slug}. */
export function blogPostPath(slug: string): string {
  const name = slug.startsWith("blog/") ? slug.slice("blog/".length) : slug
  return `/blog/${name}`
}

export function sortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function blogCategories(): string[] {
  const categories = new Set<string>()
  for (const post of BLOG_POSTS) {
    if (post.category) categories.add(post.category)
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b))
}

export function filterBlogPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  if (category === "all") return posts
  return posts.filter((post) => post.category === category)
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-cycles-minting-canister",
    title: "What Is the Cycles Minting Canister (CMC)? | ICPay",
    description:
      "How the CMC converts ICP to cycles, creates canisters, and tops them up — notify_create_canister, notify_top_up, and ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 9,
    category: "Explainers",
  },
  {
    slug: "icp-canister-controllers-explained",
    title: "ICP Canister Controllers Explained | ICPay",
    description:
      "Who can manage an ICP canister — status, start/stop, snapshots — and how Internet Identity becomes controller on create.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "Explainers",
  },
  {
    slug: "canister-out-of-cycles-fix",
    title: "Canister Out of Cycles: What Happens & How to Fix It | ICPay",
    description:
      "What happens when an ICP canister runs out of cycles and how to top up via CMC on ICPay before it freezes.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "How-to",
  },
  {
    slug: "how-to-create-icp-canister",
    title: "How to Create an ICP Canister with CMC (No dfx) | ICPay",
    description:
      "What an ICP canister is, the 500B cycle creation fee, 0.5 ICP minimum, and step-by-step CMC create on ICPay — no dfx.",
    publishedAt: "2026-09-05",
    readingMinutes: 10,
    category: "How-to",
  },
  {
    slug: "how-to-manage-icp-canister",
    title: "How to Manage an ICP Canister: Status, Start & Stop | ICPay",
    description:
      "Live canister_status, start/stop, and logs when your Internet Identity is a controller — browser guide with ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 7,
    category: "How-to",
  },
  {
    slug: "how-to-mint-cycles-ledger",
    title: "How to Mint Cycles to the Cycles Ledger | ICPay",
    description:
      "Mint ICP into cycles on the cycles ledger with notify_mint_cycles, then withdraw to any canister — ICPay cycles wallet guide.",
    publishedAt: "2026-09-05",
    readingMinutes: 8,
    category: "How-to",
  },
  {
    slug: "how-to-snapshot-icp-canister",
    title: "How to Snapshot an ICP Canister: Take, Load & Delete | ICPay",
    description:
      "Take, list, load, and delete Internet Computer canister snapshots when you are a controller — browser guide with ICPay.",
    publishedAt: "2026-09-05",
    readingMinutes: 7,
    category: "How-to",
  },
  {
    slug: "how-to-top-up-icp-cycles",
    title: "How to Top Up ICP Cycles: Canister Cycles Guide (2026)",
    description:
      "How to top up ICP cycles — convert ICP to canister cycles via the CMC, step-by-step with ICPay, fees, and how to keep canisters from freezing.",
    publishedAt: "2026-09-04",
    readingMinutes: 12,
    category: "How-to",
  },
  {
    slug: "instant-crypto-payments-icpay",
    title: "Instant Crypto Payments with ICPay: Send ICP in Seconds, Not Minutes",
    description:
      "Instant crypto payments with ICPay — sub-second ICP transfers, username sends, 0.0001 ICP fees, and passkey login. The fastest way to pay on the Internet Computer.",
    publishedAt: "2026-08-28",
    readingMinutes: 5,
    category: "Product",
  },
  {
    slug: "icrc-1-token-standard",
    title: "ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer",
    description:
      "ICRC-1 and ICRC-2 token standards on ICP — transfers, fees, wallet support, and ICRC-1 token integration for merchants and developers.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Developers",
  },
  {
    slug: "depin-on-internet-computer",
    title: "DePIN on Internet Computer: Decentralized Physical Infrastructure Networks Explained",
    description:
      "DePIN crypto on ICP — how decentralized physical infrastructure networks use canisters for coordination, ICRC payments, and on-chain data.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Ecosystem",
  },
  {
    slug: "sovereign-cloud-vs-aws-web3",
    title: "Sovereign Cloud vs. AWS: Why Next-Gen Web3 DApps Are Built 100% On-Chain",
    description:
      "Decentralized cloud vs AWS for Web3 hosting — why ICPay and other DApps run frontend, backend, and data on-chain instead of centralized servers.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Infrastructure",
  },
  {
    slug: "ckbtc-cketh-chain-key-security",
    title: "ckBTC & ckETH Explained: How Chain-Key Tech Eliminates Cross-Chain Bridge Hacks",
    description:
      "ckBTC vs wBTC — chain-key cryptography makes cross-chain assets safer than wrapped tokens. Secure crypto bridges without custodians.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Chain Fusion",
  },
  {
    slug: "on-chain-ai-internet-computer",
    title: "On-Chain AI on Internet Computer: How AI Models Run Directly Inside Canisters",
    description:
      "On-chain AI crypto on ICP — AI smart contracts in canisters without AWS. Decentralized AI infrastructure with verified outputs and cycle-based billing.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Technology",
  },
  {
    slug: "accept-icp-payments-ecommerce",
    title: "How to Accept ICP and ICRC-1 Tokens on Your E-Commerce Store",
    description:
      "Accept crypto payments with ICP payment gateway setup — payment links, QR codes, and ICRC-1 token integration for merchants.",
    publishedAt: "2026-08-28",
    readingMinutes: 7,
    category: "Merchants",
  },
  {
    slug: "ckbtc-without-btc-network-fees",
    title: "How to Send and Receive Bitcoin (ckBTC) Without Paying BTC Network Fees",
    description:
      "ckBTC payments on ICP — send Bitcoin at layer-1 speed without BTC network fees or bridge contracts. Zero-bridge Bitcoin with threshold cryptography.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Chain Fusion",
  },
  {
    slug: "internet-identity-vs-seed-phrases",
    title: "Internet Identity vs. Seed Phrases: Why Passkeys Are the Future of Crypto Security",
    description:
      "Internet Identity vs seed phrases — passkey crypto wallet security with biometrics. The seed phrase alternative ICPay uses for safer crypto.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Security",
  },
  {
    slug: "gasless-crypto-transactions-icpay",
    title: "How to Send Crypto with Zero Gas Fees Using ICPay",
    description:
      "Gasless crypto transactions on ICP — ICPay wallet users never pay gas. Cycle-based queries and the reverse gas model for instant crypto payments.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Product",
  },
  {
    slug: "jackson-hole-2026-crypto-payments",
    title:
      "Jackson Hole 2026: What Kevin Warsh's Fed Speech Means for Bitcoin, Stablecoins and Crypto Payments",
    description:
      "Fed Chair Kevin Warsh's Jackson Hole 2026 keynote puts stablecoins and crypto payments on the agenda. What it means for Bitcoin, rate expectations, and on-chain wallets.",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    category: "Market watch",
  },
  {
    slug: "un-sovereign-ai-crypto-infrastructure",
    title: "Why the UN's Sovereign AI Push Validates Crypto Infrastructure",
    description:
      "The UN is piloting decentralized AI to help governments escape Big Tech cloud dependency. For crypto projects built on sovereign infrastructure like the Internet Computer, this validates the architectural bet made years ago.",
    publishedAt: "2026-08-25",
    readingMinutes: 6,
    category: "Infrastructure",
  },
  {
    slug: "icpay-swap-and-live",
    title: "ICPay Swap & Live: Trade Tokens and Voice Rooms on the Internet Computer",
    description:
      "Swap ICP and ICRC tokens in-wallet via ICPSwap, and join on-chain voice rooms with peer-to-peer audio — how ICPay Swap and Live work.",
    publishedAt: "2026-08-17",
    readingMinutes: 6,
    category: "Product",
  },
  {
    slug: "what-is-icp",
    title: "What is ICP?",
    description:
      "A plain-language guide to the Internet Computer Protocol — how it works, why it exists, and what makes it different from other blockchains.",
    publishedAt: "2026-08-09",
    readingMinutes: 6,
  },
  {
    slug: "best-crypto-wallet",
    title: "Best Crypto Wallet in 2026: How to Choose One",
    description:
      "Custodial vs self-custody, hot vs cold storage. A practical guide to picking a crypto wallet in 2026.",
    publishedAt: "2026-08-10",
    readingMinutes: 8,
  },
  {
    slug: "best-icp-wallet",
    title: "Best ICP Wallet in 2026: Why ICPay Is the Top Internet Computer Wallet",
    description:
      "The best ICP wallet in 2026 — ICPay leads with Internet Identity login, username transfers, on-chain custody, and native ICRC-1 ledger calls. Compare features and alternatives.",
    publishedAt: "2026-08-28",
    readingMinutes: 8,
  },
  {
    slug: "what-is-internet-identity",
    title: "What is Internet Identity? The Internet Computer Login, Explained",
    description:
      "The passkey-based login system of the Internet Computer — no passwords, no seed phrases, anonymous by default.",
    publishedAt: "2026-08-10",
    readingMinutes: 5,
  },
  {
    slug: "how-to-send-icp",
    title: "How to Send ICP: Step by Step",
    description:
      "Send ICP by account ID or username, transfer fees, and the mistakes that lose funds.",
    publishedAt: "2026-08-10",
    readingMinutes: 5,
  },
  {
    slug: "icp-price",
    title: "ICP Price Today: Live Price, Technical Analysis & News",
    description:
      "Live ICP price, 7-day chart, technical read, and this week's Internet Computer news.",
    publishedAt: "2026-08-11",
    readingMinutes: 5,
  },
  {
    slug: "icp-cloud-storage",
    title: "ICP Cloud Storage in 2026: Decentralized File Storage on the Internet Computer",
    description:
      "What ICP cloud storage is, how on-chain buckets work, encrypted CDN delivery, pricing in ICP, and how it compares to AWS S3 and IPFS.",
    publishedAt: "2026-08-13",
    readingMinutes: 7,
  },
  {
    slug: "internet-computer-chain-fusion",
    title: "Internet Computer Chain Fusion Explained: How ICP Connects to Bitcoin, Ethereum and Solana",
    description:
      "How ICP canisters hold, sign, and move Bitcoin, Ethereum, and Solana natively using threshold signatures — no bridges, no custodians.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
  },
  {
    slug: "how-icp-canisters-work",
    title: "How Internet Computer Canisters Work",
    description:
      "The Wasm-based smart contracts that hold code and state on ICP — subnets, stable memory, cycles, and the path a call takes from browser to consensus.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
  },
  {
    slug: "icp-cycles-explained",
    title: "ICP Cycles Explained: How Internet Computer Apps Pay for Compute and Storage",
    description:
      "The fuel of the Internet Computer — the XDR peg, storage and compute pricing, and the reverse gas model that keeps users paying nothing.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
  },
  {
    slug: "icp-vs-ethereum",
    title: "ICP vs Ethereum: What Is the Difference?",
    description:
      "Architecture, execution, storage, fees, and finality — an honest side-by-side of the Internet Computer and Ethereum.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
  },
  {
    slug: "can-icp-replace-cloud-computing",
    title: "Can ICP Replace the Cloud? AWS vs the Internet Computer",
    description:
      "What canisters genuinely replace from the traditional cloud, what they cannot, and where the line sits for real applications.",
    publishedAt: "2026-08-16",
    readingMinutes: 7,
  },
  {
    slug: "icp-stable-memory",
    title: "ICP Stable Memory Explained: How Canisters Persist State",
    description:
      "How canisters survive upgrades with persistent stable memory, why it replaces a managed database, and what migration discipline means.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
  },
  {
    slug: "icp-subnets-explained",
    title: "ICP Subnets and Nodes Explained: How the Network Replicates State",
    description:
      "Nodes, subnets, replicas, and consensus — the physical layer that makes the Internet Computer tamper-proof.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
  },
  {
    slug: "icp-reverse-gas-model",
    title: "The ICP Reverse Gas Model Explained: Why Users Never Pay Gas",
    description:
      "How canisters prepay their own cycles so users interact for free, and what the reverse gas model means for apps and developers.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
  },
  {
    slug: "icp-https-outcalls",
    title: "ICP HTTPS Outcalls Explained: How Canisters Talk to the Outside World",
    description:
      "How canisters make HTTP requests to external APIs directly from on-chain code, what it costs, and why it removes the oracle.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
  },
  {
    slug: "how-to-stake-icp",
    title: "How to Stake ICP: NNS Neurons, Rewards, and Risks",
    description:
      "Creating a neuron, choosing a dissolve delay, voting rewards, and the liquidity risks of locking up your ICP.",
    publishedAt: "2026-08-16",
    readingMinutes: 6,
  },
  {
    slug: "icpay-bucket-sdk",
    title: "ICPay Bucket SDK: npm, Python & Go Clients",
    description:
      "Official packages for ICPay Cloud — install links, quick starts, and when to use each language client.",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    category: "Developers",
  },
]
