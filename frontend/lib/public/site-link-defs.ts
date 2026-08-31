export type SiteLinkDef = {
  id: string
  href: string
  external?: boolean
}

export type NavMenuItemDef = {
  id: string
  href: string
  external?: boolean
}

export const PUBLIC_PRIMARY_LINK_DEFS: SiteLinkDef[] = [{ id: "blog", href: "/blog" }]

export const PUBLIC_PRODUCT_MENU_DEFS: NavMenuItemDef[] = [
  { id: "wallet", href: "/login" },
  { id: "launch", href: "/token/create" },
  { id: "icbucket", href: "/icbucket" },
  { id: "icfalcon", href: "/icfalcon" },
]

export const PUBLIC_RESOURCE_MENU_DEFS: NavMenuItemDef[] = [
  { id: "falconCli", href: "/products/icFalcon/commands" },
  { id: "icpHubPackages", href: "/products/icFalcon/packages" },
  { id: "icbucketDocs", href: "/bucket/docs" },
  { id: "blog", href: "/blog" },
]

export const PUBLIC_LEGAL_MENU_DEFS: NavMenuItemDef[] = [
  { id: "charity", href: "/charity" },
  { id: "about", href: "/about" },
  { id: "faq", href: "/faq" },
  { id: "roadmap", href: "/roadmap" },
  { id: "brands", href: "/brand-protection" },
  { id: "terms", href: "/terms" },
  { id: "privacy", href: "/privacy" },
  { id: "transparency", href: "/transparency" },
]

export const PUBLIC_PRODUCT_LINK_DEFS: SiteLinkDef[] = [
  { id: "icfalcon", href: "/icfalcon" },
  { id: "icbucket", href: "/icbucket" },
  { id: "wallet", href: "/login" },
]

export const PUBLIC_RESOURCE_LINK_DEFS: SiteLinkDef[] = [
  { id: "falconCli", href: "/products/icFalcon/commands" },
  { id: "icpHubPackages", href: "/products/icFalcon/packages" },
  { id: "icbucketDocs", href: "/bucket/docs" },
  { id: "blog", href: "/blog" },
]

export const PUBLIC_COMMUNITY_LINK_DEFS: SiteLinkDef[] = [
  { id: "github", href: "https://github.com/prasangapokharel/ICPay", external: true },
  { id: "x", href: "https://x.com/IcpayOfficial", external: true },
  { id: "linkedin", href: "https://www.linkedin.com/company/icpayofficial", external: true },
  { id: "discord", href: "https://discord.gg/icpay", external: true },
]
