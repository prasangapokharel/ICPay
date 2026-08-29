export type SiteLink = {
  href: string
  label: string
  external?: boolean
}

export type NavMenuItem = {
  title: string
  href: string
  description: string
  external?: boolean
}

export const PUBLIC_PRIMARY_LINKS: SiteLink[] = [{ href: "/blog", label: "Blog" }]

export const PUBLIC_PRODUCT_MENU: NavMenuItem[] = [
  {
    title: "ICPay Wallet",
    href: "/login",
    description: "Send ICP by username with Internet Identity sign-in.",
  },
  {
    title: "ICBucket",
    href: "/icbucket",
    description: "On-chain storage with API keys, SDKs, and ICP plans.",
  },
  {
    title: "ICFalcon",
    href: "/icfalcon",
    description: "Production Motoko framework with a global CLI.",
  },
]

export const PUBLIC_RESOURCE_MENU: NavMenuItem[] = [
  {
    title: "Falcon CLI",
    href: "/products/icFalcon/commands",
    description: "Commands and workflows for ICFalcon projects.",
  },
  {
    title: "ICP-Hub Packages",
    href: "/products/icFalcon/packages",
    description: "Curated packages for Internet Computer development.",
  },
  {
    title: "ICBucket Docs",
    href: "/bucket/docs",
    description: "API reference and integration guides for storage.",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Guides, tutorials, and ICP ecosystem articles.",
  },
]

export const PUBLIC_LEGAL_MENU: NavMenuItem[] = [
  {
    title: "About",
    href: "/about",
    description: "What ICPay is and how username payments work.",
  },
  {
    title: "FAQ",
    href: "/faq",
    description: "Answers to common wallet and product questions.",
  },
  {
    title: "Roadmap",
    href: "/roadmap",
    description: "What shipped, what is next, and what we will not build.",
  },
  {
    title: "Brands",
    href: "/brand-protection",
    description: "Trademark and brand usage policy.",
  },
  {
    title: "Terms",
    href: "/terms",
    description: "Terms of service for using ICPay.",
  },
  {
    title: "Privacy",
    href: "/privacy",
    description: "How we handle data and account information.",
  },
  {
    title: "Transparency",
    href: "/transparency",
    description: "Custody model, fees, and on-chain operations.",
  },
]

export const PUBLIC_PRODUCT_LINKS: SiteLink[] = [
  { href: "/icfalcon", label: "ICFalcon" },
  { href: "/icbucket", label: "ICBucket" },
  { href: "/login", label: "ICPay Wallet" },
]

export const PUBLIC_RESOURCE_LINKS: SiteLink[] = [
  { href: "/products/icFalcon/commands", label: "Falcon CLI" },
  { href: "/products/icFalcon/packages", label: "ICP-Hub Packages" },
  { href: "/bucket/docs", label: "ICBucket Docs" },
  { href: "/blog", label: "Blog" },
]

export const PUBLIC_LEGAL_LINKS: SiteLink[] = PUBLIC_LEGAL_MENU.map((item) => ({
  href: item.href,
  label: item.title,
}))

export const PUBLIC_COMMUNITY_LINKS: SiteLink[] = [
  {
    href: "https://github.com/prasangapokharel/ICPay",
    label: "GitHub",
    external: true,
  },
  {
    href: "https://x.com/IcpayOfficial",
    label: "X",
    external: true,
  },
  {
    href: "https://www.linkedin.com/company/icpayofficial",
    label: "LinkedIn",
    external: true,
  },
  {
    href: "https://discord.gg/icpay",
    label: "Discord",
    external: true,
  },
]
