# Frontend Flow for the ICRC-2 Swap dApp

Here is the complete frontend flow based on the knowledge sources:

---

## Overall Flow Diagram

```
User Browser
    │
    ├─ 1. Load frontend (asset canister serves HTML/JS)
    │
    ├─ 2. Sign in via Internet Identity
    │       └─ AuthClient opens II popup → delegation returned
    │
    ├─ 3. Create authenticated agent (HttpAgent + identity)
    │
    ├─ 4. Approve token spend (icrc2_approve on ledger)
    │       └─ user approves backend canister to pull tokens
    │
    ├─ 5. Deposit (backend calls icrc2_transfer_from)
    │
    ├─ 6. Swap (backend swaps internal balances, no await)
    │
    └─ 7. Withdraw (backend debits first, then transfers out)
```

---

## Step-by-Step

### Step 1 — Load the App

The browser hits a boundary node → routes to the **asset (frontend) canister** → returns HTML/JS. [[App Architecture](https://docs.internetcomputer.org/getting-started/app-architecture/)]

---

### Step 2 — Sign In with Internet Identity

```js
import { AuthClient } from "@icp-sdk/auth/client";

function getIdentityProviderUrl() {
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost");

  if (isLocal) {
    return "http://id.ai.localhost:8000/authorize";
  }
  return "https://id.ai/authorize";
}

const authClient = new AuthClient({
  identityProvider: getIdentityProviderUrl(),
});

async function signIn() {
  try {
    const identity = await authClient.signIn({
      maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000), // 8 hours
    });
    console.log("Signed in as:", identity.getPrincipal().toText());
    return identity;
  } catch (error) {
    console.error("Sign-in failed:", error);
    throw error;
  }
}
```

[[Frontend Integration](https://docs.internetcomputer.org/guides/authentication/internet-identity/#frontend-integration)]

---

### Step 3 — Create Authenticated Agent + Actor

After sign-in, wrap the identity in an `HttpAgent` and create actors for the backend and token ledgers:

```js
import { HttpAgent, Actor } from "@icp-sdk/core/agent";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";

const canisterEnv = safeGetCanisterEnv();

async function createAuthenticatedActor(identity, canisterId, idlFactory) {
  const agent = await HttpAgent.create({
    identity,
    host: window.location.origin,
    rootKey: canisterEnv?.IC_ROOT_KEY,
  });

  return Actor.createActor(idlFactory, { agent, canisterId });
}
```

[[Frontend Integration](https://docs.internetcomputer.org/guides/authentication/internet-identity/#frontend-integration)]

---

### Step 4 — Approve the Backend to Spend Tokens (ICRC-2)

Before depositing, the user must approve the backend canister as a spender. The approve amount must include the transfer fee: [[ICRC-2 Swap README](https://github.com/dfinity/examples/blob/master/motoko/icrc2-swap/README.md)]

```
approve amount = deposit amount + fee
e.g. 100_010_000 to deposit 100_000_000
```

This calls `icrc2_approve` on the token ledger actor:

```js
await tokenActor.icrc2_approve({
  spender: { owner: backendCanisterId, subaccount: [] },
  amount: 100_010_000n,
  expected_allowance: [],
  expires_at: [],
  fee: [10_000n],
  memo: [],
  from_subaccount: [],
  created_at_time: [],
});
```

[[ICRC-2 Standard](https://docs.internetcomputer.org/references/digital-asset-standards/#icrc-2-approve-and-transfer-from)]

---

### Step 5 — Deposit

Call the backend's `deposit` function. The backend then calls `icrc2_transfer_from` on the ledger to pull tokens from the user into the backend canister's account.

---

### Step 6 — Swap

Call the backend's `swap` function. This is **purely synchronous on-chain** — no `await` inside, so it is atomic. [[ICRC-2 Swap README](https://github.com/dfinity/examples/blob/master/motoko/icrc2-swap/README.md)]

---

### Step 7 — Withdraw

Call the backend's `withdraw` function. Note the fee deduction: [[ICRC-2 Swap README](https://github.com/dfinity/examples/blob/master/motoko/icrc2-swap/README.md)]

```
withdraw amount = internal balance - fee
e.g. withdraw 99_990_000 when balance is 100_000_000
```

The backend **debits the internal balance first**, then calls `icrc1_transfer` to send tokens to the user.

---

## Summary Table

| Step | Who calls | What happens |
|---|---|---|
| 1 | Browser | Loads frontend from asset canister |
| 2 | User | Authenticates via Internet Identity |
| 3 | Frontend JS | Creates authenticated agent + actors |
| 4 | User → Token Ledger | `icrc2_approve` backend as spender |
| 5 | User → Backend | Backend pulls tokens via `icrc2_transfer_from` |
| 6 | User → Backend | Atomic balance swap (no await) |
| 7 | User → Backend | Backend debits first, then transfers out |