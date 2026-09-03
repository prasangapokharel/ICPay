import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen02Icon,
  CloudIcon,
  FavouriteIcon,
  ChartIncreaseIcon,
  File01Icon,
  InformationCircleIcon,
  MessageQuestionIcon,
  News01Icon,
  Package01Icon,
  Rocket01Icon,
  Route01Icon,
  ShieldIcon,
  ShoppingBag01Icon,
  TerminalIcon,
  ViewIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

export const NAV_MENU_ICONS: Record<string, IconSvgElement> = {
  "/charity": FavouriteIcon,
  "/market": ChartIncreaseIcon,
  "/blog": News01Icon,
  "/login": Wallet01Icon,
  "/token/create": Rocket01Icon,
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
