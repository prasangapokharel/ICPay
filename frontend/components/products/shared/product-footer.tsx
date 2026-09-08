import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Github01Icon, Package01Icon } from "@hugeicons/core-free-icons"
import { PublicFooter } from "@/components/public/footer"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"

export type ProductPackageLink = {
  label: string
  href: string
}

export const ICBUCKET_PACKAGE_LINKS: ProductPackageLink[] = [
  { label: "npm", href: "https://www.npmjs.com/package/icpay-bucket" },
  { label: "PyPI", href: "https://pypi.org/project/icpay-bucket/" },
  { label: "Go", href: "https://github.com/prasangapokharel/icpay-bucket-go" },
]

type ProductOpenSourceBannerProps = {
  packageLinks?: ProductPackageLink[]
  openSourceDescription?: string
}

export function ProductOpenSourceBanner({
  packageLinks,
  openSourceDescription = "All ICPay products are open source and available on GitHub",
}: ProductOpenSourceBannerProps) {
  return (
    <section className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-full bg-primary/10">
                  <Image
                    src={ICPAY_TOKEN_ICON}
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
      </div>
    </section>
  )
}

/** @deprecated Prefer PublicLayout + ProductOpenSourceBanner */
export function ProductFooter(props: ProductOpenSourceBannerProps) {
  return (
    <>
      <ProductOpenSourceBanner {...props} />
      <PublicFooter />
    </>
  )
}
