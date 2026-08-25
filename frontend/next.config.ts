import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))

// Keyed on the build phase rather than NODE_ENV: both `next build` and
// `next start` run with NODE_ENV=production, and `next start` refuses to run
// against an "export" config. `next dev` is excluded for a second reason -- it
// treats generateStaticParams as the exhaustive param list for a dynamic route
// and 500s on anything else, which would break /icpverse/<name> locally.
// Static export is for the on-chain asset canister only (ICP_STATIC_EXPORT=1 in
// build-frontend.sh). Vercel keeps a normal Next build so /api/cloud can proxy
// cloud.icpay.app → *.raw.icp0.io/cloud/* with the correct upstream Host.
const staticExport = process.env.ICP_STATIC_EXPORT === "1"
// Cache Components and Partial Prefetching need a server at build/runtime. The
// on-chain asset canister build is a static export only — keep it on the legacy
// model so deep-link shells still work through onchain-shell.js.
const cacheNav = !staticExport

export default (phase: string): NextConfig => ({
  turbopack: {
    root: frontendRoot,
  },
  output: staticExport && phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
  images: { unoptimized: true },
  cacheComponents: cacheNav,
  partialPrefetching: cacheNav,
})
