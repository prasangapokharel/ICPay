# Development and operations workflow

How code gets from a local edit to mainnet, and what stops a bad one.

---

## Change lifecycle

```mermaid
flowchart TD
    A(["edit"]) --> B{"which half?"}
    B -->|backend| C["bash scripts/run-tests.sh<br/><i>24 tests</i>"]
    B -->|frontend| D["tsc --noEmit"]
    D --> E["eslint<br/><i>baseline 5, must not rise</i>"]
    C --> F{"green?"}
    E --> F
    F -->|no| A
    F -->|yes| G["commit + push"]
    G --> H["GitHub Actions<br/>test · typecheck · build"]
    G --> I["Vercel rebuilds<br/>automatically"]
    H --> J{"CI green?"}
    J -->|no| A
    J -->|yes| K(["deployable"])
    K --> L["human: npm run ci backend:deploy"]

    style F fill:#fff9c4
    style J fill:#fff9c4
    style L fill:#e8f5e9
```

Frontend and backend deploy on **different triggers**. Vercel rebuilds itself on
every push to `main`. The canister only changes when a human runs the deploy
command. They can drift, and a frontend expecting a method the deployed canister
does not have will fail at runtime — ship backend first when adding an endpoint.

---

## The CI command surface

One entry point, `npm run ci <group>:<command>`, from the repo root.

```mermaid
graph LR
    CLI["ci/cli.ts"] --> B["backend/<br/>test build deploy<br/>rollback hash logs"]
    CLI --> F["frontend/<br/>build deploy"]
    CLI --> C["canister/<br/>list status id call info"]
    CLI --> Cy["cycles/<br/>balance topup"]
    CLI --> L["ledger/<br/>balance transfer history"]

    style CLI fill:#e3f2fd
```

```mermaid
flowchart LR
    A["npm run ci x"] --> B["mainnet"]
    C["npm run ci x --local"] --> D["<b>mainnet</b> — npm ate the flag"]
    E["npm run ci x -- --local"] --> F["local replica"]

    style D fill:#ffebee
    style F fill:#e8f5e9
```

**The bare `--` is required.** npm consumes a lone `--local` as its own flag and
leaves no recoverable trace, so the command quietly hits mainnet. Every run
prints a banner naming the network it actually resolved — that banner is the
safety net, so read it.

---

## Deploy

```mermaid
sequenceDiagram
    participant H as Human
    participant CI as npm run ci
    participant T as tests
    participant D as dfx
    participant M as mainnet

    H->>CI: backend:deploy
    CI->>T: run-tests.sh
    alt any test fails
        T-->>H: abort
    end
    CI->>D: dfx build --network ic
    CI->>H: confirm? refuses without a TTY
    H->>CI: yes
    CI->>D: dfx deploy --network ic
    D->>M: upgrade — state preserved
    M-->>CI: new module hash
    CI-->>H: prints the rollback command
```

Printing the rollback command on success means the escape hatch exists before
it is needed, not after.

---

## Rollback

```mermaid
flowchart TD
    A(["npm run ci backend:hash"]) --> B["record the current hash"]
    B --> C["backend:rollback ref hash"]
    C --> D["git worktree add — throwaway"]
    D --> E["dfx build --network ic"]
    E --> F["sha256 the wasm"]
    F --> G{"matches expected?"}
    G -->|no| H(["ABORT — mainnet untouched"])
    G -->|yes| I["confirm"]
    I --> J["canister install --mode upgrade"]
    J --> K(["rolled back"])
    L["process.on exit"] -.->|"always"| M["remove worktree"]

    style H fill:#ffebee
    style K fill:#e8f5e9
    style G fill:#fff9c4
```

**Why rebuild rather than download.** The IC keeps no archive of past wasms. A
module hash is a fingerprint, not an artifact — the only way back to old code is
to rebuild it from its commit and prove the hash matches.

Build with `--network ic`. `dfx build --check` writes to `.dfx/local`, which is
not what installs on mainnet.

Cleanup is registered on `process.on("exit")`, not in a `finally` — every guard
above exits via `process.exit`, which unwinds no `finally` and would leak the
worktree. That bug was real and is fixed.

**Your working tree is never touched.** The build happens in a temporary
worktree, uncommitted changes included.

---

## Why CI does not deploy

```mermaid
graph TB
    A["auto-deploy from CI"] --> B["controller key in a<br/>GitHub secret"]
    B --> C["that key can upgrade<br/>the canister"]
    B --> D["that key can <b>delete</b><br/>the canister"]
    D --> E(["every user record gone"])

    F["human runs deploy locally"] --> G["key stays on one machine"]
    G --> H(["blast radius bounded"])

    style E fill:#ffebee
    style H fill:#e8f5e9
```

CI runs tests, typecheck and build. Nothing else. This is a deliberate trade of
convenience for a bounded blast radius.

---

## Operational watch list

```mermaid
graph LR
    A["cycles:balance"] --> B{"trending to zero?"}
    B -->|yes| C["cycles:topup"]
    B -->|no| D(["fine"])
    E["canister:status"] --> F["memory · controllers · module hash"]
    G["backend:hash"] --> H["compare to last deploy"]

    style C fill:#fff3e0
```

**Cycles are an availability risk, not a bill.** At zero the canister is deleted
and every user record with it. Queries are free on the IC; only update calls and
idle burn (~45k cycles/s) cost anything, so a balance drifting down while nothing
is happening is normal.
