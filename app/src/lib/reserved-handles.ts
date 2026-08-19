// Handles that would shadow a real page at icpay.app/<handle>. Vercel resolves
// the filesystem before rewrites, so /login already wins over the profile shell
// on a hard load -- but a claimed "login" would still be an unreachable profile
// and a confusing link to hand out. Checked here so the page says so plainly
// instead of rendering a profile nobody can visit.
//
// Backend usernames are 1-8 chars, alphanumeric and underscore, lowercased, so
// only names inside that shape can ever collide.
const RESERVED = new Set([
  "login",
  "wallet",
  "deposit",
  "withdraw",
  "transfer",
  "profile",
  "settings",
  "icpverse",
  "username",
  "terms",
  "privacy",
  "api",
  "admin",
  "icpay",
  "support",
  "help",
  "about",
  "static",
  "public",
  "assets",
  "images",
  "audio",
  "well",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "icon",
  "og",
  "u",
  "index",
  "404",
  "video",
])

export function isReservedHandle(name: string): boolean {
  return RESERVED.has(name.trim().toLowerCase())
}

// Mirrors backend UsernameValidator.validate: anything outside this shape can
// never have been claimed, so it is a bad link rather than a free handle.
export function isPossibleHandle(name: string): boolean {
  return /^[a-zA-Z0-9_]{1,8}$/.test(name.trim())
}
