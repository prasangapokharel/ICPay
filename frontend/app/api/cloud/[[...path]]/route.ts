/**
 * Transparent streaming proxy to the IC canister CDN (cloud.icpay.app).
 *
 * CPU budget: effectively zero — this route streams the upstream response body
 * through without buffering, parsing, or transforming it. The `await fetch()`
 * call is I/O wait, not Active CPU time, so it does not count toward the
 * Vercel Fluid compute billing.
 *
 * Do NOT add JSON.parse, body buffering, or any transformation logic here.
 * Doing so converts free I/O-wait time into billable Active CPU time.
 */
import { WALLET_CANISTER_ID } from "@/services/icp"

// Terminate after 30 s — cloud files can be large, but 30 s is enough for
// any realistic upload. Prevents a hung upstream from holding the slot open
// for the full 60 s Hobby-plan limit.
export const maxDuration = 30

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

async function proxy(request: Request, segments: string[] | undefined): Promise<Response> {
  const rest = (segments ?? []).map((s) => decodeURIComponent(s)).join("/")
  if (!rest || !rest.includes("/")) {
    return new Response("Not found", { status: 404 })
  }

  const target = `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${rest}`
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      Accept: request.headers.get("Accept") ?? "*/*",
    },
  })

  const headers = new Headers(CORS_HEADERS)
  const contentType = upstream.headers.get("Content-Type")
  const cacheControl = upstream.headers.get("Cache-Control")
  if (contentType) headers.set("Content-Type", contentType)
  if (cacheControl) headers.set("Cache-Control", cacheControl)

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  })
}

type RouteCtx = { params: Promise<{ path?: string[] }> }

export async function GET(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path)
}

export async function HEAD(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
