import { communityIdenticonSvg } from "@/lib/community/identicon"
import { getPublicCommunityChannelAvatarBytes } from "@/services/community/community"

const CACHE = "public, max-age=86400, stale-while-revalidate=604800"

type RouteCtx = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params
  if (!slug || slug === "slug" || !/^[a-z0-9_]{3,32}$/.test(slug)) {
    return new Response("Not found", { status: 404 })
  }

  const bytes = await getPublicCommunityChannelAvatarBytes(slug)
  if (bytes?.length) {
    return new Response(bytes as BlobPart, {
      headers: { "Content-Type": "image/webp", "Cache-Control": CACHE },
    })
  }

  const svg = communityIdenticonSvg(slug)
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": CACHE },
  })
}
