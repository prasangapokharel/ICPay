"use client"

import { useTranslations } from "next-intl"
import {
  PUBLIC_COMMUNITY_LINK_DEFS,
  PUBLIC_LEGAL_MENU_DEFS,
  PUBLIC_PRIMARY_LINK_DEFS,
  PUBLIC_PRODUCT_LINK_DEFS,
  PUBLIC_PRODUCT_MENU_DEFS,
  PUBLIC_RESOURCE_LINK_DEFS,
  PUBLIC_RESOURCE_MENU_DEFS,
  type NavMenuItemDef,
  type SiteLinkDef,
} from "@/lib/public/site-link-defs"

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

export function usePublicSiteLinks() {
  const tNav = useTranslations("publicSite.nav") as (
    key: string,
    values?: Record<string, string | number>
  ) => string
  const tFooter = useTranslations("publicSite.footer") as (
    key: string,
    values?: Record<string, string | number>
  ) => string

  const mapMenuItems = (defs: NavMenuItemDef[], group: string): NavMenuItem[] =>
    defs.map((def) => ({
      href: def.href,
      external: def.external,
      title: tNav(`${group}.${def.id}.title`),
      description: tNav(`${group}.${def.id}.description`),
    }))

  const mapNavLabels = (defs: SiteLinkDef[], group: string): SiteLink[] =>
    defs.map((def) => ({
      href: def.href,
      external: def.external,
      label: tNav(`${group}.${def.id}`),
    }))

  const mapFooterLabels = (defs: SiteLinkDef[], group: string): SiteLink[] =>
    defs.map((def) => ({
      href: def.href,
      external: def.external,
      label: tFooter(`${group}.${def.id}`),
    }))

  return {
    primaryLinks: mapNavLabels(PUBLIC_PRIMARY_LINK_DEFS, "primary"),
    productMenu: mapMenuItems(PUBLIC_PRODUCT_MENU_DEFS, "products"),
    resourceMenu: mapMenuItems(PUBLIC_RESOURCE_MENU_DEFS, "resources"),
    legalMenu: mapMenuItems(PUBLIC_LEGAL_MENU_DEFS, "legal"),
    productLinks: mapFooterLabels(PUBLIC_PRODUCT_LINK_DEFS, "products"),
    resourceLinks: mapFooterLabels(PUBLIC_RESOURCE_LINK_DEFS, "resources"),
    legalLinks: mapFooterLabels(
      PUBLIC_LEGAL_MENU_DEFS.map((def) => ({ id: def.id, href: def.href })),
      "legal"
    ),
    communityLinks: mapFooterLabels(PUBLIC_COMMUNITY_LINK_DEFS, "community"),
    companyLinks: mapFooterLabels(
      PUBLIC_LEGAL_MENU_DEFS.slice(0, 4).map((def) => ({ id: def.id, href: def.href })),
      "legal"
    ),
    policyLinks: mapFooterLabels(
      PUBLIC_LEGAL_MENU_DEFS.slice(4).map((def) => ({ id: def.id, href: def.href })),
      "legal"
    ),
    exploreLinks: [
      { href: "/channels", label: tFooter("channels") },
      { href: "/blog", label: tFooter("blog") },
    ],
    sectionLabels: {
      products: tNav("sectionProducts"),
      resources: tNav("sectionResources"),
      more: tNav("sectionMore"),
    },
    footerSectionLabels: {
      products: tFooter("sectionProducts"),
      resources: tFooter("sectionResources"),
      legal: tFooter("sectionLegal"),
      community: tFooter("sectionCommunity"),
      company: tFooter("sectionCompany"),
      explore: tFooter("sectionExplore"),
    },
    navLabels: {
      menu: tNav("menu"),
      signIn: tNav("signIn"),
      wallet: tNav("wallet"),
      openWallet: tNav("openWallet"),
      openMenu: tNav("openMenu"),
    },
    footerLabels: {
      copyright: tFooter("copyright"),
      blog: tFooter("blog"),
      channels: tFooter("channels"),
      wallet: tFooter("wallet"),
    },
  }
}
