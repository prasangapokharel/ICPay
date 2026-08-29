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

export {
  PUBLIC_COMMUNITY_LINK_DEFS,
  PUBLIC_LEGAL_MENU_DEFS,
  PUBLIC_PRIMARY_LINK_DEFS,
  PUBLIC_PRODUCT_LINK_DEFS,
  PUBLIC_PRODUCT_MENU_DEFS,
  PUBLIC_RESOURCE_LINK_DEFS,
  PUBLIC_RESOURCE_MENU_DEFS,
} from "@/lib/public/site-link-defs"

export type { NavMenuItemDef, SiteLinkDef } from "@/lib/public/site-link-defs"
