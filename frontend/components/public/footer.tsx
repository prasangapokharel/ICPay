"use client"

import Image from "next/image"
import Link from "next/link"
import { APP_LOGO } from "@/lib/ui/brand-images"
import type { SiteLink } from "@/lib/public/site-links"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"

function FooterLink({ link }: { link: SiteLink }) {
  const className = "text-sm text-muted-foreground/75 transition-colors hover:text-foreground"

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

function FooterGroup({ title, links }: { title: string; links: SiteLink[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterColumn({ groups }: { groups: { title: string; links: SiteLink[] }[] }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <FooterGroup key={group.title} title={group.title} links={group.links} />
      ))}
    </div>
  )
}

export function PublicFooter() {
  const {
    productLinks,
    resourceLinks,
    companyLinks,
    policyLinks,
    exploreLinks,
    communityLinks,
    footerSectionLabels,
    footerLabels,
  } = usePublicSiteLinks()

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-0">
          <aside className="flex shrink-0 flex-col lg:w-44 lg:border-r lg:border-dotted lg:border-border/50 lg:pr-10 xl:w-48">
            <div>
              <Link
                href="/"
                className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={APP_LOGO}
                  alt="ICPay"
                  width={36}
                  height={36}
                  className="size-9 rounded-lg object-cover"
                  priority={false}
                />
              </Link>
              <p className="mt-2 max-w-[10.5rem] text-[11px] leading-relaxed text-muted-foreground/80">
                {footerLabels.copyright}
              </p>
            </div>

            <div className="mt-10 lg:mt-auto lg:pt-10">
              <ThemeToggle />
            </div>
          </aside>

          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:pl-10 xl:grid-cols-5 xl:gap-x-8">
            <FooterColumn
              groups={[
                { title: footerSectionLabels.products, links: productLinks },
                { title: footerSectionLabels.explore, links: exploreLinks },
              ]}
            />
            <FooterColumn groups={[{ title: footerSectionLabels.resources, links: resourceLinks }]} />
            <FooterColumn groups={[{ title: footerSectionLabels.company, links: companyLinks }]} />
            <FooterColumn groups={[{ title: footerSectionLabels.legal, links: policyLinks }]} />
            <FooterColumn groups={[{ title: footerSectionLabels.community, links: communityLinks }]} />
          </div>
        </div>
      </div>
    </footer>
  )
}
