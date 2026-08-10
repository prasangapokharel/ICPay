export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
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
]
