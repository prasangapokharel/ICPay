import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Github01Icon, Globe02Icon, Package01Icon } from "@hugeicons/core-free-icons"

export type ProductPackageLink = {
  label: string
  href: string
}

export const ICBUCKET_PACKAGE_LINKS: ProductPackageLink[] = [
  { label: "npm", href: "https://www.npmjs.com/package/icpay-bucket" },
  { label: "PyPI", href: "https://pypi.org/project/icpay-bucket/" },
  { label: "Go", href: "https://github.com/prasangapokharel/icpay-bucket-go" },
]

type ProductFooterProps = {
  packageLinks?: ProductPackageLink[]
  openSourceDescription?: string
}

export function ProductFooter({
  packageLinks,
  openSourceDescription = "All ICPay products are open source and available on GitHub",
}: ProductFooterProps) {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ICPay Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/icfalcon" className="hover:text-foreground">
                    ICFalcon
                  </Link>
                </li>
                <li>
                  <Link href="/icbucket" className="hover:text-foreground">
                    ICBucket
                  </Link>
                </li>
                <li>
                  <Link href="https://icpay.app" className="hover:text-foreground">
                    ICPay Wallet
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/icfalcon/commands" className="hover:text-foreground">
                    CLI Commands
                  </Link>
                </li>
                <li>
                  <Link href="/icfalcon/packages" className="hover:text-foreground">
                    ICP-Hub Packages
                  </Link>
                </li>
                <li>
                  <Link href="/bucket/docs" className="hover:text-foreground">
                    ICBucket Docs
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="https://github.com/prasangapokharel/ICPay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://twitter.com/icpayofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://discord.gg/icpay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    Discord
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/brand-protection" className="hover:text-foreground">
                    Brand Protection
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full bg-primary/10">
                    <Image
                      src="/images/logo/icpay/token.png"
                      alt="ICPay"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Open Source</h4>
                    <p className="text-sm text-muted-foreground">{openSourceDescription}</p>
                  </div>
                </div>
                {packageLinks ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                    {packageLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <HugeiconsIcon
                          icon={link.label === "Go" ? Github01Icon : Package01Icon}
                          className="size-4"
                        />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href="https://github.com/prasangapokharel/ICPay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <HugeiconsIcon icon={Github01Icon} className="size-4" />
                    View on GitHub
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row md:text-left">
            <p>© 2026 ICPay. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://icpay.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <HugeiconsIcon icon={Globe02Icon} className="size-4" />
                icpay.app
              </Link>
              <Link
                href="https://github.com/prasangapokharel/ICPay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <HugeiconsIcon icon={Github01Icon} className="size-4" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
