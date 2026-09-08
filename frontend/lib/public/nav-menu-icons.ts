import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen02Icon,
  CloudIcon,
  DashboardSquare01Icon,
  FavouriteIcon,
  File01Icon,
  InformationCircleIcon,
  MessageQuestionIcon,
  News01Icon,
  Camera01Icon,
  Package01Icon,
  Rocket01Icon,
  Route01Icon,
  Settings01Icon,
  ShieldIcon,
  ShoppingBag01Icon,
  TerminalIcon,
  ViewIcon,
  Wallet01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"

export const NAV_MENU_ICONS: Record<string, IconSvgElement> = {
  "/charity": FavouriteIcon,
  "/blog": News01Icon,
  "/login": Wallet01Icon,
  "/token/create": Rocket01Icon,
  "/canister": DashboardSquare01Icon,
  "/canister/tools": Package01Icon,
  "/canister/manage": Settings01Icon,
  "/canister/create": Package01Icon,
  "/canister/cycles": Wallet01Icon,
  "/canister/snapshots": Camera01Icon,
  "/topup": ZapIcon,
  "/icbucket": CloudIcon,
  "/icfalcon": Rocket01Icon,
  "/products/icFalcon/commands": TerminalIcon,
  "/products/icFalcon/packages": Package01Icon,
  "/bucket/docs": BookOpen02Icon,
  "/about": InformationCircleIcon,
  "/faq": MessageQuestionIcon,
  "/roadmap": Route01Icon,
  "/brand-protection": ShoppingBag01Icon,
  "/terms": File01Icon,
  "/privacy": ShieldIcon,
  "/transparency": ViewIcon,
}

export function getNavMenuIcon(href: string): IconSvgElement {
  return NAV_MENU_ICONS[href] ?? File01Icon
}
