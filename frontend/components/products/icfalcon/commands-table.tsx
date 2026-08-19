import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

type CommandGroup = {
  title: string
  description: string
  commands: {
    short: string
    full: string
    description: string
    example?: string
    useCase: string
  }[]
}

const commandGroups: CommandGroup[] = [
  {
    title: "Setup",
    description: "Initialize project and manage local replica",
    commands: [
      {
        short: "s:init",
        full: "setup:init",
        description: "Install all dependencies, build canister, start dev server",
        example: "falcon s:init",
        useCase: "First-time project setup",
      },
      {
        short: "r:start",
        full: "replica:start",
        description: "Start local dfx replica in background",
        example: "falcon r:start",
        useCase: "Local development",
      },
      {
        short: "r:stop",
        full: "replica:stop",
        description: "Stop local dfx replica",
        example: "falcon r:stop",
        useCase: "Clean shutdown",
      },
    ],
  },
  {
    title: "Packages (icp-hub)",
    description: "Install and manage packages from icp-hub registry",
    commands: [
      {
        short: "p:list",
        full: "package:list",
        description: "List all available packages from icp-hub",
        example: "falcon p:list",
        useCase: "Discover available modules",
      },
      {
        short: "add pkg",
        full: "add package",
        description: "Install a package by slug",
        example: "falcon add pkg crud",
        useCase: "Add functionality",
      },
      {
        short: "p:push",
        full: "package:push",
        description: "Publish your package to icp-hub",
        example: "falcon p:push mypkg",
        useCase: "Share reusable modules",
      },
    ],
  },
  {
    title: "Scaffold",
    description: "Generate modules with full backend + frontend layers",
    commands: [
      {
        short: "m:f",
        full: "module:feature",
        description: "Scaffold complete module (storage, repo, service, API, frontend)",
        example: "falcon m:f Order",
        useCase: "Create new feature",
      },
    ],
  },
  {
    title: "Backend",
    description: "Build, test, and deploy canister",
    commands: [
      {
        short: "b:test",
        full: "backend:test",
        description: "Run all backend tests",
        example: "falcon b:test --local",
        useCase: "Verify logic before deploy",
      },
      {
        short: "b:build",
        full: "backend:build",
        description: "Compile Motoko canister",
        example: "falcon b:build --local",
        useCase: "Check compilation",
      },
      {
        short: "b:deploy",
        full: "backend:deploy",
        description: "Build and upgrade canister (never reinstall)",
        example: "falcon b:deploy",
        useCase: "Deploy to mainnet",
      },
      {
        short: "b:hash",
        full: "backend:hash",
        description: "Get deployed module hash",
        example: "falcon b:hash",
        useCase: "Verify deployment",
      },
      {
        short: "b:logs",
        full: "backend:logs",
        description: "Stream canister logs",
        example: "falcon b:logs",
        useCase: "Debug production issues",
      },
    ],
  },
  {
    title: "Canister",
    description: "Inspect and interact with deployed canister",
    commands: [
      {
        short: "c:status",
        full: "canister:status",
        description: "Cycles, memory, controllers, module hash",
        example: "falcon c:status",
        useCase: "Health check",
      },
      {
        short: "c:ping",
        full: "canister:ping",
        description: "Test canister reachability",
        example: "falcon c:ping --local",
        useCase: "Verify canister is live",
      },
      {
        short: "c:call",
        full: "canister:call",
        description: "Call canister method (query by default)",
        example: "falcon c:call getUser '(\"alice\")' --local",
        useCase: "Manual testing",
      },
      {
        short: "c:list",
        full: "canister:list",
        description: "List all canister IDs",
        example: "falcon c:list",
        useCase: "Check deployed IDs",
      },
      {
        short: "c:id",
        full: "canister:id",
        description: "Get this canister ID",
        example: "falcon c:id",
        useCase: "Quick ID lookup",
      },
    ],
  },
  {
    title: "Cycles",
    description: "Monitor cycles balance and burn rate",
    commands: [
      {
        short: "y:bal",
        full: "cycles:balance",
        description: "Show balance and estimated runway",
        example: "falcon y:bal",
        useCase: "Track canister health",
      },
      {
        short: "y:addr",
        full: "cycles:address",
        description: "Get cycles ledger account ID",
        example: "falcon y:addr",
        useCase: "Top-up preparation",
      },
    ],
  },
  {
    title: "Production",
    description: "Full build and deploy workflows",
    commands: [
      {
        short: "p:check",
        full: "prod:check",
        description: "Build backend + frontend (no deploy)",
        example: "falcon p:check",
        useCase: "Pre-deploy verification",
      },
      {
        short: "p:ship",
        full: "prod:ship",
        description: "Deploy backend + build frontend",
        example: "falcon p:ship",
        useCase: "Release new version",
      },
    ],
  },
  {
    title: "Frontend",
    description: "Next.js development and build",
    commands: [
      {
        short: "f:dev",
        full: "frontend:dev",
        description: "Start Next.js dev server",
        example: "falcon f:dev",
        useCase: "Frontend development",
      },
      {
        short: "f:build",
        full: "frontend:build",
        description: "Static export for production",
        example: "falcon f:build",
        useCase: "Prepare for hosting",
      },
    ],
  },
  {
    title: "Users",
    description: "Inspect user and feature counts",
    commands: [
      {
        short: "u:count",
        full: "users:count",
        description: "Show user count and feature status",
        example: "falcon u:count",
        useCase: "Monitor growth",
      },
    ],
  },
]

export function CommandsTable() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-12">
        {commandGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                {group.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.commands.map((cmd) => (
                <Card key={cmd.short} size="sm">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">
                      {cmd.short}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {cmd.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cmd.example && (
                      <pre className="overflow-x-auto rounded bg-muted/30 p-2 text-xs font-mono">
                        <code>{cmd.example}</code>
                      </pre>
                    )}
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Use case:</span>{" "}
                      {cmd.useCase}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
