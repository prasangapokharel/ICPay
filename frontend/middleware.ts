import { NextRequest, NextResponse } from "next/server"
import { productHostRewritePath } from "@/lib/public/product-host-routing"

export function middleware(request: NextRequest) {
  const rewritePath = productHostRewritePath(
    request.headers.get("host"),
    request.nextUrl.pathname
  )

  if (!rewritePath) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = rewritePath
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
