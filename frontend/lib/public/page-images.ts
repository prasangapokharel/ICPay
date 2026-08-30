const page = (segment: string) => `/images/pages/${segment}` as const

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function pageImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl}${path}`
}

export const PAGE_IMAGES = {
  landing: {
    heroPhone: page("landing/hero-phone.png"),
    paymentFlow: page("landing/payment-flow.webp"),
  },
  icbucket: {
    heroPhone: page("icbucket/hero-phone.png"),
    hero: page("icbucket/hero.png"),
  },
  icfalcon: {
    hero: page("icfalcon/hero.png"),
  },
  login: {
    bg: page("login/bg.webp"),
  },
  presale: {
    cardBg: page("presale/bg.svg"),
  },
} as const
