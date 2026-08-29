"use client"

import Link from "next/link"
import type { SiteLink } from "@/lib/public/site-links"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"

function FooterColumn({ title, links }: { title: string; links: SiteLink[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PublicFooter() {
  const {
    productLinks,
    resourceLinks,
    legalLinks,
    communityLinks,
    footerSectionLabels,
    footerLabels,
  } = usePublicSiteLinks()

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title={footerSectionLabels.products} links={productLinks} />
          <FooterColumn title={footerSectionLabels.resources} links={resourceLinks} />
          <FooterColumn title={footerSectionLabels.legal} links={legalLinks} />
          <FooterColumn title={footerSectionLabels.community} links={communityLinks} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>{footerLabels.copyright}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/blog" className="hover:text-foreground">
              {footerLabels.blog}
            </Link>
            <Link href="/channels" className="hover:text-foreground">
              {footerLabels.channels}
            </Link>
            <Link href="/login" className="hover:text-foreground">
              {footerLabels.wallet}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
