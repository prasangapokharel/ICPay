# Frontend architecture

Next.js 16.2.6, React 19, App Router, `output: "export"` — a fully static build.
No server, no API routes, no server actions. Every dynamic thing happens in the
browser against the canister.

---

## Route groups

The group decides the auth policy. That is the whole reason they exist.

```mermaid
graph TB
    Root["app/layout.tsx<br/>metadata · fonts · providers"]

    subgraph Guarded["(app) — layout redirects anonymous → /login"]
        D["/ dashboard"]
        T["/transfer"]
        Dep["/deposit"]
        W["/withdraw"]
        Wa["/wallet"]
        Tx["/transactions"]
        P["/profile"]
        S["/settings"]
        U["/username"]
        IV["/icpverse"]
    end

    subgraph AuthG["(auth) — public"]
        L["/login"]
    end

    subgraph Legal["(legal) — public + crawlable"]
        Ab["/about"]
        F["/faq"]
        Te["/terms"]
        Pr["/privacy"]
        Tr["/transparency"]
    end

    subgraph Profile["(profile) — public"]
        PU["/[username]"]
    end

    Root --> Guarded & AuthG & Legal & Profile

    style Guarded fill:#e3f2fd
    style AuthG fill:#fff3e0
    style Legal fill:#f1f8e9
    style Profile fill:#f3e5f5
```

**Why legal pages sit outside `(app)`.** The `(app)` layout redirects anonymous
visitors, which would make Terms and Privacy invisible to a crawler — and
unreadable by someone deciding whether to sign up. `(legal)` has no guard, so
those pages prerender to real static HTML.

`/login` is the only crawlable entry point into the app, so it carries the
inbound links to `/about`, `/faq` and `/transparency`.

---

## Layers

```mermaid
graph TB
    subgraph P["app/ — pages"]
        Pages["route components"]
    end

    subgraph C["components/"]
        UI["ui/ — shadcn primitives"]
        Dom["auth · layout · dashboard · transfer<br/>transactions · deposit · withdraw<br/>profile · wallet · icpverse · scan<br/>legal · shared"]
    end

    subgraph H["hooks/"]
        SWR["use-wallet-data.ts — the SWR layer"]
        Misc["use-debounced · use-mobile"]
    end

    subgraph S["services/ — canister clients"]
        Cl["client.ts — actor factory"]
        Icp["icp.ts — agent · II · derivation origin"]
        Tok["tokens.ts — ICRC-1 discovery + balances"]
        Dirs["auth · transfer · withdraw · deposit<br/>buy · profile · dashboard<br/>transactions · account · wallet"]
    end

    subgraph Lib["lib/ — pure helpers"]
        Helpers["account-id · icp-address · username<br/>receipt · avatar · wallet-utils<br/>use-icp-price · reserved-handles<br/>profile-url · success-chime"]
    end

    Pages --> Dom --> UI
    Pages --> SWR --> Dirs --> Cl --> Icp
    Dom --> Helpers
    Tok --> Icp

    style P fill:#e3f2fd
    style C fill:#e8f5e9
    style H fill:#fff3e0
    style S fill:#fce4ec
    style Lib fill:#f1f8e9
```

`lib/` is pure — no network, no React. That is what makes it testable without a
canister.

---

## Auth flow

The part people get wrong: **the dApp never runs the WebAuthn ceremony.**
Internet Identity does, in its own window. A credential minted from this origin
would be unrelated to the user's principal and could not sign a single canister
call.

```mermaid
sequenceDiagram
    participant U as User
    participant App as AuthProvider
    participant AC as AuthClient
    participant II as Internet Identity
    participant BE as ICPay canister

    U->>App: Connect Wallet
    App->>AC: createAuthClient()
    AC->>II: open window(identityProvider, derivationOrigin)
    Note over II: passkey / FaceID / Google / QR-to-phone —<br/>all of it happens in II's window
    II-->>AC: delegation chain
    AC-->>App: Identity
    App->>BE: openBackendSession(identity) → login()
    BE-->>App: { user, isNew }
    alt isNew or no username
        App-->>U: UsernamePrompt (non-dismissable)
    else
        App-->>U: dashboard
    end
```

```mermaid
graph LR
    A["window.location.origin"] --> B{"is it a pinned<br/>origin?"}
    B -->|"icpay.app<br/>www.icpay.app<br/>ic-pay.vercel.app"| C["derivationOrigin =<br/>63dke-…icp0.io"]
    B -->|"localhost, LAN IP,<br/>preview URL"| D["derivationOrigin =<br/><b>undefined</b>"]
    C --> E["same principal<br/>on all three domains"]
    D --> F["<b>different principal</b><br/>= a different wallet,<br/>zero balance"]

    style C fill:#e8f5e9
    style E fill:#e8f5e9
    style D fill:#ffebee
    style F fill:#ffebee
```

**This trips everyone at least once.** Signing in from `localhost` or a LAN IP
gives a *different principal*, so the wallet looks empty. Nothing is lost — it
is simply a different account. localhost can never be added to the alternative
origins list because II requires HTTPS.

`public/.well-known/ii-alternative-origins` and `ALTERNATIVE_ORIGINS` in
`services/icp.ts` must stay byte-identical. If they drift, one domain silently
breaks.

---

## Data fetching

SWR. `hooks/use-wallet-data.ts` is the only place that talks to it.

```mermaid
graph TB
    Id["Identity"] --> Key["keyFor(identity, ...parts)<br/><i>principal is part of every key</i>"]

    Key --> D["useDashboard()<br/>revalidating"]
    Key --> LB["useLiveBalance()<br/>polled"]
    Key --> DA["useDepositAddress()<br/><b>useSWRImmutable</b>"]
    Key --> T["useTransactions(page, size)"]

    Act(["send · withdraw · buy"]) --> RW["useRefreshWallet()"]
    RW -->|"matches only<br/>fund-related keys"| D & LB & T
    RW -.->|"never"| DA

    style DA fill:#e8f5e9
    style RW fill:#fff3e0
```

**The identity is baked into every cache key** so that signing out and back in
as someone else cannot show the previous user's balance from cache.

**Deposit address is `useSWRImmutable`** because it is derived
deterministically from the principal — it cannot change, so revalidating it is
pure waste.

**`useRefreshWallet` matches selectively.** Invalidating every key for the
principal would also drop the immutable deposit address and re-fetch static
data on every send.

---

## Build and deploy

```mermaid
graph LR
    Src["app/ components/ services/"] --> TSC["tsc --noEmit"]
    TSC --> Lint["eslint<br/><i>baseline: 5 errors, must not rise</i>"]
    Lint --> Build["next build<br/>output: export"]
    Build --> Out["out/ — static HTML"]
    Out --> V["Vercel<br/>auto on push to main"]
    Out --> AC["asset canister<br/>manual: npm run ci frontend:deploy"]

    style Lint fill:#fff9c4
    style V fill:#fff3e0
    style AC fill:#e8f5e9
```

`next lint` was removed in Next 16. Verify from `frontend/`:

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx
```

The lint baseline is exactly **5** `react-hooks/set-state-in-effect` errors. It
must not rise.

Environment values are baked in **at build time** by a static export. Changing
`NEXT_PUBLIC_SITE_URL` in Vercel does nothing until a rebuild.
