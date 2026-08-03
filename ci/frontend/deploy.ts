// Ships the frontend to the asset canister. Vercel is not deployed from here --
// it rebuilds itself on every push to main.
//
// Delegates to the shell script rather than reimplementing it: that script pins
// NEXT_PUBLIC_DERIVATION_ORIGIN and greps the deployed page for real copy,
// because a stale canister still answers 200 on every path via the SPA
// fallback. A second copy of that logic would drift, and the one that drifts is
// the one that silently repoints every user's principal.
import { BACKEND, FRONTEND, confirm, run, step } from "../lib.ts"

step("TYPECHECK")
run("npm", ["run", "typecheck"], FRONTEND)

confirm("deploy the frontend to the mainnet asset canister")

step("DEPLOY")
run("bash", ["scripts/deploy-frontend.sh"], BACKEND)
