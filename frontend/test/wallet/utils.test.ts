import {
  isHexAccountId,
  parseIcp,
  parseTokenAmount,
  formatE8s,
  formatTokenAmount,
  toPlainTokenAmount,
  shortPrincipal,
  formatPrincipal,
  memoByteLength,
  E8S,
} from "../../lib/wallet/utils"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

// Hex account identifier validation
assert(isHexAccountId("a".repeat(64)), "valid 64-char hex account id")
assert(!isHexAccountId("a".repeat(63)), "63-char account id rejected")
assert(!isHexAccountId("g".repeat(64)), "non-hex chars rejected")

// ICP amount parser
assert(parseIcp("1") === E8S, "1 ICP parses to 100,000,000 e8s")
assert(parseIcp("0.5") === 50_000_000n, "0.5 ICP parses to 50,000,000 e8s")
assert(parseIcp("1,000.50") === 100_050_000_000n, "comma formatted parses")
assert(parseIcp("-1") === null, "negative rejected")
assert(parseIcp("abc") === null, "text rejected")
assert(parseIcp("0") === null, "zero rejected")

// Token amount parser (exact precision across decimals)
assert(parseTokenAmount("1.5", 6) === 1_500_000n, "6 decimals parsed")
assert(parseTokenAmount("0.000000000000000001", 18) === 1n, "18 decimals (1 wei) parsed without float rounding")
assert(parseTokenAmount("1.0000001", 6) === null, "excess precision rejected")

// Token amount formatters
assert(formatE8s(100_000_000n) === "1.00000000", "e8s exact format")
assert(formatTokenAmount(1_500_000n, 6) === "1.5", "token amount formatted")
assert(formatTokenAmount(100n, 8) === "0.000001", "small token amount sub-trimmed")
assert(toPlainTokenAmount(1_500_000n, 6) === "1.5", "plain token amount")
assert(toPlainTokenAmount(1_000_000n, 6) === "1", "plain token whole amount")

// Principal formatting
assert(shortPrincipal("aaaaa-aa") === "aaaaa-aa", "short principal untouched")
assert(shortPrincipal("6vbhm-nqaaa-aaaan-q6muq-cai") === "6vbhm-…-cai", "long principal 6/4 split")
assert(formatPrincipal("6vbhm-nqaaa-aaaan-q6muq-cai") === "6vbhm...q-cai", "format principal 5/5 split")

// Memo byte length
assert(memoByteLength("hello") === 5, "ascii byte length")
assert(memoByteLength("🔥") === 4, "utf-8 emoji 4 bytes")

console.log("wallet utils ok")
