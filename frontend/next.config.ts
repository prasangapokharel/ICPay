import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

// Keyed on the build phase rather than NODE_ENV. Both `next build` and
// `next start` run with NODE_ENV=production, so a NODE_ENV check turned the
// export on during `next start` too -- and `next start` refuses to run against
// an "export" config. The phase separates them: only the build exports.
export default (phase: string): NextConfig => ({
  // The app is fully client-rendered, so it can ship as plain files. An ICP
  // asset canister can only serve static output, and Internet Identity will
  // only read /.well-known/ii-alternative-origins from a canister -- that file
  // is what lets the Vercel domain share one principal with the canister origin.
  //
  // `next dev` is excluded as well: it treats generateStaticParams as the
  // exhaustive list of a dynamic route's params and 500s on anything else, so
  // /icpverse/<name> would break locally.
  output: phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
  // next/image optimization needs a server; there is none behind a static export.
  images: { unoptimized: true },
})
