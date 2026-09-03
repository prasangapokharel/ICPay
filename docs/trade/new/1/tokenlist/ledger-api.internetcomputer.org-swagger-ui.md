I'm sorry, but I cannot access live URLs or fetch content from external links like `https://ledger-api.internetcomputer.org/openapi.json` or `https://ledger-api.internetcomputer.org/swagger-ui/` in real time.

However, based on what the knowledge sources document about the **Ledger API**, here is a detailed summary:

---

## Ledger API — Detailed Summary

**Base URL:** `https://ledger-api.internetcomputer.org`
**Purpose:** Read-only data for the **mainnet ICP token only**. For other ICRC tokens (ckBTC, SNS tokens), use the ICRC API instead. [[Ledger API docs](https://docs.internetcomputer.org/references/ic-dashboard-api/#ledger-api)]

---

### Endpoint Groups

| Group | What It Returns |
|-------|----------------|
| `Accounts` | Accounts that have made transactions, account balance history, transaction history per account |
| `Transactions` | Transaction history, transaction details, daily transaction counts |
| `Total & Circulating Supplies` | Total ICP supply, circulating supply, supply over time |
| `ICP Burned` | Total ICP burned |
| `Metrics` | Transaction volume metrics, unique accounts per day |

---

### Key Endpoints with Examples

```bash
# List accounts (v2 cursor pagination)
curl -s "https://ledger-api.internetcomputer.org/v2/accounts?limit=10"

# Get a specific account by account_identifier (64-char hex)
curl -s "https://ledger-api.internetcomputer.org/accounts/<ACCOUNT_IDENTIFIER>"

# List transactions (v2 cursor pagination)
curl -s "https://ledger-api.internetcomputer.org/v2/transactions?limit=10"

# Get total ICP supply (latest)
curl -s "https://ledger-api.internetcomputer.org/supply/total/latest"
```

[[Implementation examples](https://skills.internetcomputer.org/skills/ic-dashboard/#implementation)]

---

### Pagination Behaviour

- Uses **cursor-based pagination** on v2 endpoints.
- Query params: `after`, `before`, `limit`
- Response cursors: **`next_cursor`** and **`prev_cursor`** (note: `prev_cursor` — not `previous_cursor` like other ICP APIs)
- Row arrays are named after the resource (e.g. `accounts`, `transactions`) — **not** a generic `data` key. [[Pagination notes](https://skills.internetcomputer.org/skills/ic-dashboard/#ic-dashboard-apis)]

---

### Important Notes

- **Account identifier format:** Uses 64-character hex strings, not raw principals.
- **Timestamps:** Time-range params (`start`, `end`) expect **Unix seconds** (integer), not milliseconds or ISO strings.
- **No authentication required** — fully public read-only API.
- **Do NOT use ICRC API for mainnet ICP** — the ICRC API only exposes TestICP and other ICRC ledgers. [[Common mistakes](https://skills.internetcomputer.org/skills/ic-dashboard/#mistakes-that-break-your-build)]

---

### OpenAPI Spec

```bash
# Fetch the full OpenAPI spec for codegen or validation
curl -s "https://ledger-api.internetcomputer.org/openapi.json" -o ledger-api.json
```

For the most up-to-date and complete endpoint details, I recommend browsing the live Swagger UI directly at `https://ledger-api.internetcomputer.org/swagger-ui/`.