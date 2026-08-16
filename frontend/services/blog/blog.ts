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

export const BLOG_POSTS: BlogPost[] = [
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
    title: "Best ICP Wallet in 2026: Store and Send Internet Computer",
    description:
      "How to store, send, and receive ICP safely — custodial vs self-custody, Internet Identity, and username transfers.",
    publishedAt: "2026-08-10",
    readingMinutes: 7,
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
