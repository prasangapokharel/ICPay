import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

// Keyed on the build phase rather than NODE_ENV: both `next build` and
// `next start` run with NODE_ENV=production, and `next start` refuses to run
// against an "export" config. `next dev` is excluded for a second reason -- it
// treats generateStaticParams as the exhaustive param list for a dynamic route
// and 500s on anything else, which would break /icpverse/<name> locally.
// Static export is for the on-chain asset canister only (ICP_STATIC_EXPORT=1 in
// build-frontend.sh). Vercel keeps a normal Next build so /api/cloud can proxy
// cloud.icpay.app → *.raw.icp0.io/cloud/* with the correct upstream Host.
const staticExport = process.env.ICP_STATIC_EXPORT === "1"

export default (phase: string): NextConfig => ({
  output: staticExport && phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
  images: { unoptimized: true },
})
