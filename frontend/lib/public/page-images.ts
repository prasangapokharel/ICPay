const page = (segment: string) => `/images/pages/${segment}` as const

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function pageImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl}${path}`
}

export const PAGE_IMAGES = {
  landing: {
    heroPhone: page("landing/hero-phone.webp"),
    heroDesktop: page("landing/desktop.webp"),
    laptopMockup: page("landing/laptop-mockup.webp"),
    paymentFlow: page("landing/payment-flow.webp"),
  },
  icbucket: {
    heroPhone: page("icbucket/hero-phone.webp"),
    hero: page("icbucket/hero.webp"),
  },
  icfalcon: {
    hero: page("icfalcon/hero.webp"),
  },
  login: {
    bg: page("login/bg.webp"),
  },
  presale: {
    cardBg: page("presale/bg.svg"),
  },
  downloads: {
    windows: page("downloads/microsoft-windows-icon.svg"),
    linux: page("downloads/linux-tux.svg"),
    fedora: page("downloads/fedora.svg"),
    macos: page("downloads/apple.svg"),
  },
} as const
