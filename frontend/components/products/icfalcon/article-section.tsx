import { Card, CardContent } from "@/components/ui/card"

export function ArticleSection() {
  return (
    <section className="px-4 py-24">
      <article className="mx-auto max-w-4xl space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            What is ICFalcon?
          </h2>
          <p className="text-lg text-muted-foreground">
            A framework that gives you structure, tooling, and speed for
            building Internet Computer applications
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Framework, not boilerplate
            </h3>
            <p>
              ICFalcon is an opinionated starting point for Motoko applications.
              It enforces a four-layer backend architecture (api → service →
              repository → storage), pairs it with a modern Next.js frontend,
              and provides a global CLI to scaffold, build, and deploy.
            </p>
            <p className="mt-3">
              Unlike minimal templates that leave you to figure out structure on
              your own, ICFalcon gives you patterns that scale — the same ones
              used in production apps like ICPay. You get stable memory
              management, migration guides, Internet Identity integration, and a
              testing harness from day one.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Layered backend architecture
            </h3>
            <p>
              The backend follows strict separation of concerns. API modules
              handle HTTP and validation. Services contain business logic.
              Repositories abstract data access. Storage manages stable memory.
            </p>
            <p className="mt-3">
              This layering is enforced by convention and documented in the repo.
              When you scaffold a new module with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon m:f Product
              </code>
              , it generates all four layers, wires them into{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                main.mo
              </code>
              , and creates matching frontend service files. No guessing, no
              manual wiring.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Frontend integration
            </h3>
            <p>
              The frontend is Next.js with shadcn/ui components and Internet
              Identity authentication. It exports to static files (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                output: &quot;export&quot;
              </code>
              ) so it can be hosted on an asset canister or a conventional host
              like Vercel.
            </p>
            <p className="mt-3">
              Agent configuration, identity derivation, and canister IDs are
              pre-wired. The backend canister serves a{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">.did</code>{" "}
              file that the frontend automatically fetches. No manual actor
              generation or environment juggling.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              The falcon CLI
            </h3>
            <p>
              Every operation runs through one global command. Initialize a
              project (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon s:init
              </code>
              ). Scaffold a module (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon m:f Name
              </code>
              ). Run tests (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon b:test --local
              </code>
              ). Deploy (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon b:deploy
              </code>
              , prompts for confirmation).
            </p>
            <p className="mt-3">
              The CLI wraps dfx, mops, and npm, and adds scaffolding for
              modules, API endpoints, and frontend services. It targets local or
              mainnet with a{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                --local
              </code>{" "}
              flag, defaulting to mainnet for safety. Commands are documented in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                ops/docs/commands.md
              </code>
              .
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Hub packages
            </h3>
            <p>
              ICFalcon integrates with icp-hub, a collection of plug-and-play
              Motoko packages. Install ledger integration, file storage, rate
              limiting, or other common patterns with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                falcon add pkg &lt;name&gt;
              </code>
              . Each package follows the same four-layer structure and includes
              tests.
            </p>
            <p className="mt-3">
              Packages are versioned and tested independently. The hub is
              open-source, so you can contribute modules back or fork them for
              custom needs.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Who is it for?
            </h3>
            <p>
              ICFalcon is for developers who want to ship production-ready ICP
              apps without reinventing structure. If you are building a canister
              that needs stable memory, a layered backend, Internet Identity
              auth, and a modern frontend, ICFalcon gets you there faster.
            </p>
            <p className="mt-3">
              It is not a minimal template. It is opinionated. The layering is
              enforced, the CLI is the primary interface, and the stack is
              Motoko + Next.js. If you need that stack and want a clear starting
              point, ICFalcon is it.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Stack overview
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold">Backend:</span>
                  <span className="text-xs">
                    Motoko · mo:core · api → service → repository → storage
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold">Frontend:</span>
                  <span className="text-xs">
                    Next.js · shadcn/ui · Internet Identity · static export
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold">Tooling:</span>
                  <span className="text-xs">
                    falcon CLI · module scaffolds · icp-hub packages
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>
    </section>
  )
}
