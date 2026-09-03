export type PublicWalletMenuLink = {
  href: string
  labelKey: "deposit" | "transfer" | "withdraw"
}

export const PUBLIC_WALLET_MENU_LINKS: PublicWalletMenuLink[] = [
  { href: "/deposit", labelKey: "deposit" },
  { href: "/transfer", labelKey: "transfer" },
  { href: "/withdraw", labelKey: "withdraw" },
]
