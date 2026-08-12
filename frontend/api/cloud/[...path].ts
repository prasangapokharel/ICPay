const CANISTER_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

export const config = {
  runtime: "edge",
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 })
  }

  const { pathname } = new URL(request.url)
  const rest = pathname.replace(/^\/api\/cloud\/?/, "").replace(/^\/+/, "")
  if (!rest || !rest.includes("/")) {
    return new Response("Not found", { status: 404 })
  }

  const target = `https://${CANISTER_ID}.raw.icp0.io/cloud/${rest}`
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
