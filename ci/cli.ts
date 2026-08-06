#!/usr/bin/env node
// Single entry point: npm run ci <group>:<command> [args]
//
// Targets mainnet unless given `-- --local`. The bare `--` matters: npm eats a
// lone `--local` as its own flag and the command would silently hit mainnet, so
// the banner always prints the network it actually resolved.
//
// Commands are looked up as files, so adding one means adding a file and one
// line here -- there is no registry that can silently drift.
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { banner } from "./ascii.ts"

const here = dirname(fileURLToPath(import.meta.url))

const COMMANDS: Record<string, string> = {
  "backend:test": "backend/test.ts",
  "backend:build": "backend/build.ts",
  "backend:deploy": "backend/deploy.ts",
  "backend:rollback": "backend/rollback.ts",
  "backend:hash": "backend/hash.ts",
  "backend:wasm": "backend/wasm.ts",
  "backend:reclaim": "backend/reclaim.ts",
  "backend:sweep": "backend/sweep.ts",
  "backend:register": "backend/register.ts",
  "backend:logs": "backend/logs.ts",
  "frontend:build": "frontend/build.ts",
  "frontend:deploy": "frontend/deploy.ts",
  "canister:list": "canister/list.ts",
  "canister:status": "canister/status.ts",
  "canister:id": "canister/id.ts",
  "canister:call": "canister/call.ts",
  "canister:info": "canister/info.ts",
  "cycles:balance": "cycles/balance.ts",
  "cycles:address": "cycles/address.ts",
  "cycles:convert": "cycles/convert.ts",
  "cycles:topup": "cycles/topup.ts",
  "ledger:balance": "ledger/balance.ts",
  "ledger:transfer": "ledger/transfer.ts",
  "ledger:history": "ledger/history.ts",
}

const name = process.argv[2]
const file = name ? COMMANDS[name] : undefined
const target = process.argv.includes("--local") ? "local" : "mainnet"

if (!file) {
  banner("Internet Computer wallet — operations")
  if (name) console.error(`Unknown command: ${name}\n`)
  console.error("Usage: npm run ci <command> [args]\n")
  console.error("Everything targets mainnet. For a local replica: npm run ci <command> -- --local")
  console.error("(the bare -- is required; npm swallows --local otherwise)\n")
  let group = ""
  for (const key of Object.keys(COMMANDS)) {
    const next = key.split(":")[0]
    if (next !== group) {
      console.error("")
      group = next
    }
    console.error(`  ${key}`)
  }
  process.exit(1)
}

banner(`${name}  ·  ${target}`)

const path = resolve(here, file)
if (!existsSync(path)) {
  console.error(`Command file missing: ${file}`)
  process.exit(1)
}

await import(pathToFileURL(path).href)
