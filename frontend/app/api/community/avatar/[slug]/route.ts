import { communityIdenticonSvg } from "@/lib/community/identicon"
import { getPublicCommunityChannelAvatarBytes } from "@/services/community/community"

// Terminate the function after 15 s — IC avatar fetches should complete well
// under 5 s. This prevents a slow or unresponsive canister from holding the
// slot open for the full 60 s Hobby-plan limit and burning Active CPU budget.
export const maxDuration = 15

// 7-day max-age: avatars rarely change. stale-while-revalidate lets the CDN
// serve the cached copy while refreshing in the background (no user-visible
// latency on revalidation). CDN-Cache-Control and Surrogate-Control instruct
// Vercel's edge CDN independently of the browser Cache-Control header.
const CACHE = "public, max-age=604800, stale-while-revalidate=2592000"
const CDN_CACHE = "public, max-age=604800"

type RouteCtx = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params
  // Reject invalid slugs before any IC canister call (first line of defence
  // against bots cycling through random strings and bypassing the CDN cache).
  if (!slug || slug === "slug" || !/^[a-z0-9_]{3,32}$/.test(slug)) {
    return new Response("Not found", { status: 404 })
  }

  const bytes = await getPublicCommunityChannelAvatarBytes(slug)
  if (bytes?.length) {
    return new Response(bytes as BlobPart, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": CACHE,
        "CDN-Cache-Control": CDN_CACHE,
        "Surrogate-Control": CDN_CACHE,
      },
    })
  }

  const svg = communityIdenticonSvg(slug)
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": CACHE,
      "CDN-Cache-Control": CDN_CACHE,
      "Surrogate-Control": CDN_CACHE,
    },
  })
}
