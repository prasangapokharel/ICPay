import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The app is fully client-rendered, so it can ship as plain files. An ICP
  // asset canister can only serve static output, and Internet Identity will
  // only read /.well-known/ii-alternative-origins from a canister -- that file
  // is what lets the Vercel domain share one principal with the canister origin.
  output: "export",
  // next/image optimization needs a server; there is none behind a static export.
  images: { unoptimized: true },
}

export default nextConfig
