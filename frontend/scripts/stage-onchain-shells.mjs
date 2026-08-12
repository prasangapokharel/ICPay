#!/usr/bin/env node
/**
 * After `next build`, tag prerendered dynamic-route shells so the on-chain
 * asset canister can serve the right HTML for deep links (see onchain-shell.js).
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const outDir = join(import.meta.dirname, "..", "out")

const shells = [
  { file: "bucket/id.html", id: "bucket-id" },
  { file: "launch/id.html", id: "launch-id" },
  { file: "token/token.html", id: "token-ledger" },
  { file: "icpverse/profile.html", id: "icpverse-profile" },
  { file: "u.html", id: "profile-u" },
]

const metaFor = (id) =>
  `<meta name="icpay-shell" content="${id}"/>`

for (const { file, id } of shells) {
  const path = join(outDir, file)
  let html = readFileSync(path, "utf8")
  if (html.includes('name="icpay-shell"')) continue
  html = html.replace("<head>", `<head>${metaFor(id)}`)
  writeFileSync(path, html)
}

console.log(`Tagged ${shells.length} on-chain route shells in ${outDir}`)
