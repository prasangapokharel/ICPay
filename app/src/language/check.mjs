// Every locale must have exactly the keys en/common.json has. next-intl does
// not fall back to English -- a key missing from one catalog renders as its own
// path ("settings.items.send") in the UI, so this has to fail the build instead.
//
//   node language/check.mjs
//
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))

// Parsed out of config.ts rather than imported: Node cannot require a TS module,
// and a second hardcoded list would be one more thing to forget to update.
const codes = [...readFileSync(join(here, "config.ts"), "utf8").matchAll(/code:\s*"([a-z-]+)"/g)].map(
  (m) => m[1],
)

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )

const load = (code) => JSON.parse(readFileSync(join(here, code, "common.json"), "utf8"))
const baseline = flatten(load("en"))

let failed = 0
for (const code of codes) {
  if (code === "en") continue
  const keys = flatten(load(code))
  const missing = baseline.filter((k) => !keys.includes(k))
  const extra = keys.filter((k) => !baseline.includes(k))
  if (missing.length || extra.length) {
    failed++
    console.error(`${code}  FAIL`)
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`)
    if (extra.length) console.error(`  extra:   ${extra.join(", ")}`)
  } else {
    console.log(`${code}  ok  (${keys.length} keys)`)
  }
}

console.log(`\nen baseline: ${baseline.length} keys across ${codes.length} locales`)
if (failed) {
  console.error(`${failed} locale(s) out of sync with en/common.json`)
  process.exit(1)
}
