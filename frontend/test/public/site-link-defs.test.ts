import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  PUBLIC_LEGAL_MENU_DEFS,
  PUBLIC_PRIMARY_LINK_DEFS,
  PUBLIC_PRODUCT_LINK_DEFS,
  PUBLIC_PRODUCT_MENU_DEFS,
  PUBLIC_RESOURCE_MENU_DEFS,
} from "../../lib/public/site-link-defs"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(PUBLIC_PRIMARY_LINK_DEFS.length === 1, "one primary")
assert(PUBLIC_PRIMARY_LINK_DEFS[0]?.id === "markets", "markets first")
assert(!PUBLIC_RESOURCE_MENU_DEFS.some((d) => d.id === "blog"), "blog not in resources menu")
assert(!PUBLIC_LEGAL_MENU_DEFS.some((d) => d.id === "blog"), "blog not in legal defs")

const root = join(import.meta.dirname, "../../language")
for (const loc of readdirSync(root)) {
  const file = join(root, loc, "common.json")
  if (!existsSync(file)) continue
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    publicSite: {
      nav: { primary: Record<string, string>; products: Record<string, { title: string; description: string }> }
      footer: { products: Record<string, string> }
    }
  }
  for (const def of PUBLIC_PRIMARY_LINK_DEFS) {
    assert(!!data.publicSite.nav.primary[def.id], `${loc} nav.primary.${def.id}`)
  }
  for (const def of PUBLIC_PRODUCT_MENU_DEFS) {
    assert(!!data.publicSite.nav.products[def.id]?.title, `${loc} nav.products.${def.id}.title`)
  }
  for (const def of PUBLIC_PRODUCT_LINK_DEFS) {
    assert(!!data.publicSite.footer.products[def.id], `${loc} footer.products.${def.id}`)
  }
}

console.log("site-link-defs ok")
