import { rememberTokenLogo, rememberedTokenLogo, usableTokenLogo } from "../../lib/market/tokenLogo"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(usableTokenLogo("https://example.com/a.png") === "https://example.com/a.png", "https")
assert(usableTokenLogo("data:image/png;base64,abc")?.startsWith("data:image") === true, "data")
assert(usableTokenLogo("javascript:alert(1)") === null, "reject")
assert(usableTokenLogo(null) === null, "empty")
rememberTokenLogo("vchf", "https://example.com/vchf.png")
assert(rememberedTokenLogo("vchf") === "https://example.com/vchf.png", "remember")
rememberTokenLogo("vchf", "javascript:x")
assert(rememberedTokenLogo("vchf") === "https://example.com/vchf.png", "reject overwrite")
console.log("tokenLogo ok")
