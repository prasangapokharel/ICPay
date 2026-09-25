"use client"

import Image from "next/image"
import Link from "next/link"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import type { SiteLink } from "@/lib/public/site-links"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"

function getCommunityIcon(label: string, href: string) {
  const l = (label + href).toLowerCase()
  if (l.includes("github")) {
    return (
      <svg viewBox="0 0 438.549 438.549" className="size-3.5 shrink-0 fill-current opacity-70 group-hover:opacity-100 transition-opacity">
        <path d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z" />
      </svg>
    )
  }
  if (l.includes("x.com") || l.includes("twitter") || l === "x") {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current opacity-70 group-hover:opacity-100 transition-opacity">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  if (l.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current opacity-70 group-hover:opacity-100 transition-opacity">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    )
  }
  if (l.includes("discord")) {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current opacity-70 group-hover:opacity-100 transition-opacity">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    )
  }
  return null
}

function FooterLink({ link }: { link: SiteLink }) {
  const icon = getCommunityIcon(link.label, link.href)
  const className = "group inline-flex items-center gap-2 text-sm text-muted-foreground/75 transition-colors hover:text-foreground"

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {icon}
        <span>{link.label}</span>
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {icon}
      <span>{link.label}</span>
    </Link>
  )
}

function FooterGroup({ title, links }: { title: string; links: SiteLink[] }) {
  return (
    <div className="space-y-3">
      <p
        role="heading"
        aria-level={3}
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        {title}
      </p>
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
      <div className="w-full px-4 py-14 md:px-6 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-0">
          <aside className="flex shrink-0 flex-col lg:w-44 lg:border-r lg:border-dotted lg:border-border/50 lg:pr-10 xl:w-48">
            <div>
              <Link
                href="/"
                className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={APP_LOGO}
                  alt={APP_LOGO_ALT}
                  title={APP_LOGO_ALT}
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
