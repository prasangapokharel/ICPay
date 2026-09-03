# Ledger API — Endpoint Reference

> **Source:** Internet Computer Ledger API  
> **Swagger UI:** https://ledger-api.internetcomputer.org/swagger-ui/  
> **OpenAPI:** https://ledger-api.internetcomputer.org/openapi.json  
> **OpenAPI version:** 3.0.3  
> **API version:** 5.7.1
>
> This document is derived from the official published OpenAPI specification. The Ledger API provides a traditional REST API over the ICP ledger canister's indexed transaction/account data.

## Base URL

```text
https://ledger-api.internetcomputer.org
```

## Important notes

- Prefer the `/v2` account and transaction endpoints where available.
- The published OpenAPI marks the older `/accounts` and `/transactions` endpoints as deprecated.
- Pagination for v2 uses cursors rather than offset pagination.
- Amounts, balances, fees, volumes, and token values are returned as strings in the API schemas to avoid numeric precision loss.
- Unix timestamps are represented as `int64` epoch seconds.
- The API is specifically for the ICP ledger. It is **not** a generic index of every ICRC token canister on ICP.
- The published OpenAPI currently describes several v2 parameters as `in: path` even though the endpoint paths do not contain those parameter placeholders. Treat the Swagger/OpenAPI document as the source of truth for the API implementation and verify generated clients against the live service.

---

# 1. Accounts

## GET `/accounts`

Browse all accounts that have made transactions in the ledger.

**Status:** Deprecated  
**Replacement:** `GET /v2/accounts`

### Query parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `limit` | int32 | No | Number of results. Default `10`, maximum `50`. |
| `offset` | int64 | No | Result offset. Default `0`, maximum documented as `50`. |
| `sort_by` | string | No | Account sort field. Example: `account_identifier`. |

### Response

```json
{
  "total": 123,
  "accounts": [
    {
      "account_identifier": "...",
      "balance": "100000000",
      "percentage": "0.01",
      "suspicious": false,
      "transaction_count": "42",
      "updated_at": 1750000000,
      "value_usd": "5.25"
    }
  ]
}
```

---

## GET `/accounts/{account_identifier}`

Retrieve the latest information for one account.

### Path

```text
account_identifier
```

Account identifier represented as a string.

### Response

```json
{
  "account_identifier": "...",
  "balance": "100000000",
  "percentage": "0.01",
  "suspicious": false,
  "transaction_count": "42",
  "updated_at": 1750000000,
  "value_usd": "5.25"
}
```

---

## GET `/accounts/{account_identifier}/balance-history`

Retrieve daily balance history for an SNS treasury account.

### Path

```text
account_identifier
```

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `start` | int64 | Start Unix timestamp. |
| `start_date` | string | Start date. |
| `end` | int64 | End Unix timestamp. |
| `end_date` | string | End date. |

### Response

```json
{
  "data": [
    {
      "balance": "100000000",
      "date": "2026-09-01",
      "timestamp": 1756684800
    }
  ]
}
```

---

## GET `/accounts/{account_identifier}/transactions`

Browse transactions for an account.

**Status:** Deprecated  
**Replacement:** `GET /v2/accounts/{account_identifier}/transactions`

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `from_account` | string | Filter by sender. |
| `to_account` | string | Filter by receiver. |
| `transfer_type` | string | Comma-separated transfer types: `transfer`, `mint`, `burn`, `approve`. |
| `max_block_index` | int64 | Include transactions at or below this block height. |
| `limit` | int32 | Default `10`, maximum `100`. |
| `offset` | int64 | Offset. |
| `sort_by` | string | Sort fields: `block_height`, `to_account`, `from_account`, `amount`, `transfer_type`, `created_at`. Prefix with `-` for descending. |
| `start` | int64 | Start Unix timestamp. |
| `end` | int64 | End Unix timestamp. |
| `transaction_hash` | string | Filter by transaction hash. |
| `block_height` | int64 | Filter by block height. |
| `suspicious` | int32 | `0`: suspicious = 0/null. `1`: suspicious >= 1. |

### Example

```http
GET /accounts/{account_identifier}/transactions?limit=100&sort_by=-block_height
```

---

## GET `/accounts/{account_identifier}/transactions_flow`

Return transactions related to an account as a graph.

### Query parameters

| Parameter | Type | Required |
|---|---|---:|
| `to` | boolean | No |
| `depth` | int32 | Yes |
| `limit` | int32 | No |
| `offset` | int32 | No |

### Example

```http
GET /accounts/{account_identifier}/transactions_flow?depth=2&limit=50
```

---

# 2. V2 Accounts

## GET `/v2/accounts`

Browse accounts using cursor pagination.

### Parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `limit` | int32 | Yes | Default `10`, maximum `50`. |
| `sort_by` | SortBy | Yes | Account sort mode. |
| `before` | string[] | Yes | Cursor(s) before the current result. |
| `after` | string[] | Yes | Cursor(s) after the current result. |

### Response

```json
{
  "accounts": [
    {
      "account_identifier": "...",
      "balance": "100000000",
      "percentage": "0.01",
      "suspicious": false,
      "transaction_count": "42",
      "updated_at": 1750000000,
      "value_usd": "5.25"
    }
  ],
  "next_cursor": "...",
  "prev_cursor": "..."
}
```

### Pagination

Use the returned cursor instead of repeatedly increasing an offset:

```text
first request
    ↓
next_cursor
    ↓
next request
    ↓
next_cursor
```

This is preferable for a scalable indexer.

---

## GET `/v2/accounts-count`

Return the total number of accounts.

### Response

```json
{
  "total": 1234567
}
```

---

# 3. V2 Account Transactions

## GET `/v2/accounts/{account_identifier}/transactions`

Browse transactions belonging to an account.

### Parameters

The published OpenAPI exposes the following filters:

| Parameter | Type | Description |
|---|---|---|
| `account_identifier` | string | Account identifier. |
| `from_account` | string | Sender filter. |
| `to_account` | string | Receiver filter. |
| `transfer_type` | string | Comma-separated transaction types. |
| `max_block_index` | int64 | Maximum block height. |
| `limit` | int32 | Default `10`, maximum `100`. |
| `sort_by` | string | Sortable: `block_height`, `to_account`, `from_account`, `amount`, `transfer_type`, `created_at`. Prefix `-` for descending. |
| `created_at_start` | int64 | Start Unix timestamp. |
| `created_at_end` | int64 | End Unix timestamp. |
| `transaction_hash` | string | Transaction hash filter. |
| `block_hash` | string | Block hash filter. |
| `block_height` | int64 | Block height filter. |
| `before` | string[] | Previous cursor(s). |
| `after` | string[] | Next cursor(s). |
| `suspicious` | int32 | `0` normal/null only; `1` suspicious >= 1. |
| `include_token_values` | boolean | Include token price/volume data for each transaction. |

### Response

```json
{
  "blocks": [],
  "next_cursor": "...",
  "prev_cursor": "..."
}
```

> The exact response fields should be generated from the live OpenAPI schema when creating a typed client.

---

## GET `/v2/accounts/{account_identifier}/transactions-count`

Return total transaction count for an account.

The endpoint accepts the same transaction filter family as the v2 account transaction endpoint and returns:

```json
{
  "total": 123
}
```

---

# 4. Transactions

## GET `/transactions`

Browse ledger transactions.

**Status:** Deprecated  
**Replacement:** `GET /v2/transactions`

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `from_account` | string | Sender. |
| `to_account` | string | Receiver. |
| `transfer_type` | string | Comma-separated: `transfer`, `mint`, `burn`, `approve`. |
| `max_block_index` | int64 | Maximum block height. |
| `limit` | int32 | Default `10`, maximum `100`. |
| `offset` | int64 | Offset. |
| `sort_by` | string | `block_height`, `to_account`, `from_account`, `amount`, `transfer_type`, `created_at`; prefix `-` for descending. |
| `start` | int64 | Start timestamp. |
| `end` | int64 | End timestamp. |
| `transaction_hash` | string | Transaction hash. |
| `block_height` | int64 | Block height. |
| `suspicious` | int32 | `0` normal/null; `1` suspicious >= 1. |

---

## GET `/transactions/{transaction_hash}`

Retrieve a known transaction.

### Path

```text
transaction_hash
```

### Response

A `Transaction` object.

```json
{
  "block_height": "123456",
  "block_hash": "...",
  "transaction_hash": "...",
  "transfer_type": "transfer",
  "amount": "100000000",
  "fee": "10000",
  "memo": "123",
  "created_at": 1750000000
}
```

---

# 5. V2 Transactions

## GET `/v2/transactions`

Browse ledger transactions using the v2 API.

### Supported filters

- `from_account`
- `to_account`
- `transfer_type`
- `max_block_index`
- `limit`
- `sort_by`
- `created_at_start`
- `created_at_end`
- `transaction_hash`
- `block_hash`
- `block_height`
- `before`
- `after`
- `suspicious`
- `include_token_values`

### Transaction types

```text
transfer
mint
burn
approve
```

### Important for trading/indexing

For a trading platform, useful filters include:

```text
sort_by=-block_height
transfer_type=transfer
include_token_values=true
```

Use cursor pagination for continuous ingestion rather than offset pagination.

---

## GET `/v2/transactions-count`

Return total transaction count matching the supplied filters.

```json
{
  "total": 123456789
}
```

---

# 6. ICP Burned

## GET `/icp-burned/latest`

Return the latest ICP burned/fee data point.

### Query

```text
burn_type=fee
```

or

```text
burn_type=burn
```

### `burn_type`

```text
fee
burn
```

---

## GET `/icp-burned/series`

Return ICP burned data over a time range.

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `start` | int64 | Start Unix timestamp. |
| `end` | int64 | End Unix timestamp. |
| `step` | int32 | Time-series step. |
| `burn_type` | enum | `fee` or `burn`. |

---

# 7. Metrics

## GET `/metrics/transaction-volume`

Return transaction-volume time-series data.

### Query parameters

| Parameter | Type |
|---|---|
| `start` | int64 |
| `start_datetime` | string |
| `end` | int64 |
| `end_datetime` | string |
| `account_identifier` | string |
| `step` | Seconds |
| `trunc` | string |

### Response

```json
{
  "meta": {
    "total_transactions_for_all_time": 123,
    "total_transactions_for_dataset": 100,
    "total_volume_for_all_time": "100000000",
    "total_volume_for_dataset": "1000000"
  },
  "data": [
    {
      "date": "2026-09-01",
      "timestamp": 1756684800,
      "count": 100,
      "volume": "1000000"
    }
  ]
}
```

---

## GET `/metrics/transactions-over-time`

Return transaction count over time.

### Query

```text
start
end
step
```

### Response

An array of data points:

```text
[timestamp, value]
```

---

## GET `/metrics/transactions-per-day`

Return daily transaction statistics.

### Query parameters

| Parameter | Type |
|---|---|
| `start` | int64 |
| `start_date` | date |
| `end` | int64 |
| `end_date` | date |
| `account_identifier` | string |

### Response

Includes:

- dataset transaction count
- all-time transaction count
- dataset volume
- all-time volume
- daily transaction records

---

## GET `/metrics/unique-accounts-per-day`

Return daily unique-account statistics.

### Query

```text
start
start_date
end
end_date
```

### Response

```json
{
  "data": []
}
```

---

# 8. Circulating Supply

## GET `/supply/circulating/latest`

Return the latest circulating supply.

### Response

```text
[timestamp, value]
```

---

## GET `/supply/circulating/latest.txt`

Return the latest circulating supply as formatted ICP text.

Useful for simple display or shell tooling.

---

## GET `/supply/circulating/series`

Return circulating supply over a time range.

### Required query

| Parameter | Type | Required |
|---|---|---:|
| `step` | int32 | Yes |
| `start` | int64 | Yes |
| `end` | int64 | Yes |

### Optional

```text
version=V1
```

or

```text
version=V2
```

---

# 9. Total Supply

## GET `/supply/total/latest`

Return the latest calculated total ICP supply.

### Response

```text
[timestamp, value]
```

---

## GET `/supply/total/latest.txt`

Return the latest total supply as formatted ICP text.

---

## GET `/supply/total/series`

Return total supply over a time range.

### Required query

```text
step
start
end
```

Example:

```http
GET /supply/total/series?step=3600&start=1756684800&end=1756771200
```

---

# 10. Core Schemas

## Account

```json
{
  "account_identifier": "string",
  "balance": "string",
  "percentage": "string",
  "suspicious": false,
  "transaction_count": "string",
  "updated_at": 1750000000,
  "value_usd": "string"
}
```

| Field | Type | Meaning |
|---|---|---|
| `account_identifier` | string | ICP account identifier. |
| `balance` | string | ICP balance. |
| `percentage` | string | Percentage of total ICP supply. |
| `suspicious` | boolean | Whether suspicious activity was detected. |
| `transaction_count` | string | Number of transactions involving the account. |
| `updated_at` | int64 | Last update timestamp. |
| `value_usd` | string | USD value of balance. |

---

# Transaction

```json
{
  "allowance": "string",
  "amount": "string",
  "block_hash": "string",
  "block_height": "string",
  "created_at": 1750000000,
  "expected_allowance": "string",
  "expires_at": 1750000000,
  "fee": "string",
  "from_account_identifier": "string",
  "from_account_suspicious": false,
  "from_to_suspicious_account": false,
  "icrc1_memo": "string",
  "memo": "string",
  "parent_hash": "string",
  "spender_account_identifier": "string",
  "suspicious": 0,
  "to_account_identifier": "string",
  "to_account_suspicious": false,
  "token_value": {},
  "transaction_hash": "string",
  "transfer_type": "transfer"
}
```

### Transaction fields

| Field | Type | Description |
|---|---|---|
| `amount` | string | ICP amount involved. |
| `fee` | string | ICP fee. |
| `block_height` | string | Block height. |
| `block_hash` | string | Block hash. |
| `parent_hash` | string | Previous block hash. |
| `transaction_hash` | string | Transaction hash. |
| `created_at` | int64 | Epoch seconds. |
| `from_account_identifier` | string | Sender. |
| `to_account_identifier` | string | Receiver. |
| `spender_account_identifier` | string | Spender for allowance-based operations. |
| `transfer_type` | enum | `transfer`, `mint`, `burn`, `approve`. |
| `memo` | string | Integer transaction nonce/memo representation. |
| `icrc1_memo` | string | ICRC-1 memo text. |
| `allowance` | string | Allowance amount for approve-related transfers. |
| `expected_allowance` | string | Expected allowance. |
| `expires_at` | int64 | Allowance expiry timestamp. |
| `suspicious` | int32 | Suspicion level. `0` or null is normal. |
| `from_account_suspicious` | boolean | Sender suspicion flag. |
| `to_account_suspicious` | boolean | Receiver suspicion flag. |
| `from_to_suspicious_account` | boolean | Combined suspicion flag. |
| `token_value` | object | Optional token price/volume information. |

---

# TransferType

```text
transfer
mint
burn
approve
```

---

# BurnType

```text
fee
burn
```

---

# DataPoint

The API models a series data point as a two-item array:

```text
[timestamp, value]
```

---

# BalanceHistory

```json
{
  "balance": "string",
  "date": "string",
  "timestamp": 1750000000
}
```

---

# Pagination Strategy

For a trading/indexing backend, use the v2 cursor endpoints.

Recommended pattern:

```text
                 Ledger API
                     │
                     ▼
              fetch page
                     │
                     ▼
               persist data
                     │
                     ▼
              next_cursor
                     │
                     └──────────► fetch next page
```

Do not use:

```text
offset=0
offset=100
offset=200
...
```

for a long-running indexer when a cursor endpoint is available.

---

# ICPay Integration

The Ledger API is useful for **ICP ledger data**, but it should not be treated as a universal ICP token registry.

For ICPay's market system:

```text
                    ICPay Indexer
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Ledger API       ICRC ledgers    DEX/indexers
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    Token Store
                         │
                         ▼
                  Market API v1
```

Use this Ledger API for:

- ICP transactions
- ICP accounts
- ICP balances
- ICP supply
- ICP burned
- ICP transaction metrics
- account activity
- suspicious-account signals

Do **not** use it alone to discover every ICRC token canister launched on ICP.

For an ICP token market index, separately discover/verify ICRC ledger canisters and query their ICRC metadata such as:

```text
icrc1_name()
icrc1_symbol()
icrc1_decimals()
icrc1_total_supply()
icrc1_metadata()
```

Then store the normalized result in ICPay.

---

# Recommended ICPay internal API

Do not expose the upstream Ledger API directly to your Next.js frontend.

Use your Go backend:

```text
GET /api/v1/markets/tokens
GET /api/v1/markets/tokens/new
GET /api/v1/markets/tokens/trending
GET /api/v1/markets/tokens/{canister_id}

GET /api/v1/markets/transactions
GET /api/v1/markets/transactions/{hash}

GET /api/v1/markets/accounts/{account_id}
```

Your Go service owns:

```text
external APIs
      ↓
normalization
      ↓
PostgreSQL
      ↓
cache
      ↓
ICPAY /api/v1
      ↓
Next.js
```

This keeps the frontend independent of upstream API changes and gives ICPay one stable API contract.

---

## Source

Official Swagger UI:

https://ledger-api.internetcomputer.org/swagger-ui/

Official OpenAPI specification:

https://ledger-api.internetcomputer.org/openapi.json

The current published specification identifies the service as `ledger-api`, OpenAPI `3.0.3`, API version `5.7.1`, and explicitly marks the legacy account/transaction endpoints as deprecated in favor of v2. 
