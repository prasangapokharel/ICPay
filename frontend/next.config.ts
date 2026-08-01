import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

// Keyed on the build phase rather than NODE_ENV: both `next build` and
// `next start` run with NODE_ENV=production, and `next start` refuses to run
// against an "export" config. `next dev` is excluded for a second reason -- it
// treats generateStaticParams as the exhaustive param list for a dynamic route
// and 500s on anything else, which would break /icpverse/<name> locally.
export default (phase: string): NextConfig => ({
  // The app is fully client-rendered, and an ICP asset canister can only serve
  // static output.
  output: phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
  // next/image optimization needs a server; there is none behind a static export.
  images: { unoptimized: true },
})
