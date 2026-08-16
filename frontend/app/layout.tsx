import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider, ThemeColorScript } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { LocaleProvider } from "@/components/i18n/locale-provider"
import { FiatProvider } from "@/components/fiat/fiat-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"
const title = "ICPay — Send ICP by Username"
const description =
  "ICPay is an ICP wallet that lets you send and receive Internet Computer tokens using a username instead of a long principal address. Sign in with Internet Identity, no seed phrase required."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s — ICPay" },
  description,
  applicationName: "ICPay",
  keywords: [
    "ICP wallet",
    "send ICP by username",
    "Internet Computer wallet",
    "ICP transfer",
    "Internet Identity wallet",
    "ICRC-1 wallet",
    "crypto wallet no seed phrase",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ICPay",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ICPay — send ICP by username" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "6jnIRWeq6mzEmElP-A7kd2_VRBtz8PAl8vsUnWZSFoc",
    yandex: "5ad19f1b1325ba5b",
  },
}

export const viewport: Viewport = {
  // No themeColor here on purpose. React hoists metadata tags and owns them, so
  // a runtime edit gets reverted, and a prefers-color-scheme tag would keep
  // matching the OS instead of the class toggle the app actually uses.
  // themeColorScript + ThemeColorSync own the single tag instead.
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ICPay",
  url: siteUrl,
  description,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Send ICP by username",
    "Receive ICP to a personal deposit address",
    "Internet Identity sign-in without a seed phrase",
    "Transaction history with on-chain block links",
  ],
  // Named so the sitelinks a search result shows are the pages a stranger can
  // actually read, rather than whichever signed-in route was crawled first.
  sameAs: ["https://github.com/prasangapokharel/ICPay"],
  isPartOf: {
    "@type": "WebSite",
    name: "ICPay",
    url: siteUrl,
    hasPart: [
      { "@type": "WebPage", name: "About", url: `${siteUrl}/about` },
      { "@type": "WebPage", name: "FAQ", url: `${siteUrl}/faq` },
      { "@type": "WebPage", name: "Transparency", url: `${siteUrl}/transparency` },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <ThemeColorScript />
        {/* On-chain asset canister: load the prerendered shell before Next hydrates. */}
        <script src="/onchain-shell.js" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <LocaleProvider>
            <FiatProvider>
              <AuthProvider>{children}</AuthProvider>
            </FiatProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
