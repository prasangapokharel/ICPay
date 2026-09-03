import { PUBLIC_WALLET_MENU_LINKS } from "../../lib/public/nav-wallet-menu"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(PUBLIC_WALLET_MENU_LINKS.length === 3, "three links")
assert(PUBLIC_WALLET_MENU_LINKS[0]?.href === "/deposit", "deposit")
assert(PUBLIC_WALLET_MENU_LINKS[1]?.href === "/withdraw", "transfer")
assert(PUBLIC_WALLET_MENU_LINKS[2]?.href === "/transfer", "withdraw")
console.log("navWalletMenu ok")
