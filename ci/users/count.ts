import { CANISTER, dfxOutMany } from "../lib.ts"

// npm run ci users:count [recent]
//
// There is no count endpoint on the canister, so this reconstructs the roll from
// searchUsers. That call caps at Config.MAX_SEARCH_RESULTS, which is why a lone
// searchUsers('("")') reports 25 and not the truth.
//
// The sweep is exhaustive rather than a sample: usernames are a-z0-9_ (see
// UsernameValidator.isValidChar), search lowercases and matches a substring, and
// every handle is at least one character -- so every user matches at least one
// single-character needle below. A needle that comes back full is re-run with
// each second character appended, since a full page means the cap truncated it.
//
// It counts users who have claimed a handle. searchUsers walks the username
// index, so an account that authenticated and never claimed one is not reachable
// from any public query and is not in these totals.
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789_"
const PAGE = 25

type User = { id: string; username: string; createdAt: number }

// Candid text, not JSON. Nat/Int literals carry _ separators, and createdAt is
// nanoseconds since the epoch stamped by UUID.generate().
function parse(candid: string): User[] {
  const rows: User[] = []
  const re =
    /id = "([^"]+)";\s*username = opt "([^"]*)";[\s\S]*?createdAt = ([\d_]+)\s*:\s*int/g
  for (const m of candid.matchAll(re)) {
    rows.push({ id: m[1], username: m[2], createdAt: Number(m[3].replaceAll("_", "")) })
  }
  return rows
}

const search = async (needles: string[]): Promise<string[]> =>
  dfxOutMany(needles.map((n) => ["canister", "call", CANISTER, "searchUsers", `("${n}")`, "--query"]))

const found = new Map<string, User>()
const record = (candid: string): number => {
  const rows = parse(candid)
  for (const u of rows) found.set(u.id, u)
  return rows.length
}

const first = await search([...ALPHABET])
const saturated = [...ALPHABET].filter((c, i) => record(first[i]) >= PAGE)

if (saturated.length > 0) {
  const pairs = saturated.flatMap((a) => [...ALPHABET].map((b) => a + b))
  const second = await search(pairs)
  const stillFull = pairs.filter((p, i) => record(second[i]) >= PAGE)
  // Two characters resolve every needle at the current user count. If that ever
  // stops being true the total is an undercount, so it is said out loud rather
  // than papered over with a third pass.
  if (stillFull.length > 0) {
    console.log(`\nIncomplete: these needles still return a full page — ${stillFull.join(", ")}`)
    console.log("Counts below are a floor, not a total.\n")
  }
}

const users = [...found.values()].sort((a, b) => b.createdAt - a.createdAt)

// Local midnight, matching how someone reading "today" means it.
const midnight = new Date()
midnight.setHours(0, 0, 0, 0)
const NS = 1_000_000
const day = (u: User): Date => new Date(u.createdAt / NS)
const today = users.filter((u) => day(u) >= midnight)

console.log(`Users:  ${users.length}`)
console.log(`Today:  ${today.length}`)

const limit = Number(process.argv[3]) || 10
console.log(`\nLatest ${Math.min(limit, users.length)}:`)
for (const u of users.slice(0, limit)) {
  const when = day(u).toISOString().replace("T", " ").slice(0, 16)
  console.log(`  ${when}  ${u.username || "(no username)"}`)
}
