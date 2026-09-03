# ICP Public Dashboard API — Endpoint Reference

> **Official source:** Internet Computer Public Dashboard API  
> **Base URL:** `https://ic-api.internetcomputer.org`  
> **OpenAPI:** `https://ic-api.internetcomputer.org/api/v3/openapi.json`  
> **Swagger/OpenAPI version:** OpenAPI 3.0.3  
> **API title:** Public Dashboard API  
> **API version:** v3
>
> This document is a practical reference for the public Dashboard API described by the official OpenAPI document. It is especially useful when building an ICP market/indexing backend.

---

## 1. API scope

This API is the **Internet Computer public dashboard data API**. It exposes network, canister, subnet, node, NNS/governance, ICP price, economic, Bitcoin integration, and dashboard/user-management data.

It is **not an ICRC token registry** and it is **not a DEX market API**.

For ICPay's trading platform, the most relevant areas are:

- Canisters
- ICP/USD and ICP/XDR rates
- Network/subnet data
- Metrics
- NNS/proposals
- Images
- Canister discovery

The official OpenAPI lists these endpoint groups and identifies the API as the Public Dashboard API v3. citeturn4view0

---

# 2. Base URL

```text
https://ic-api.internetcomputer.org
```

Example:

```http
GET https://ic-api.internetcomputer.org/api/v3/canisters
```

OpenAPI:

```text
https://ic-api.internetcomputer.org/api/v3/openapi.json
```

---

# 3. Common query parameters

Many time-series endpoints share the same parameters.

| Parameter | Type | Meaning |
|---|---|---|
| `format` | string | `json` or `csv` where supported |
| `start` | number | Start Unix timestamp |
| `end` | number | End Unix timestamp |
| `step` | integer/number | Time-series resolution |
| `subnet` | string | Subnet ID |
| `network` | enum | `mainnet` or `testnet` where supported |

For many metrics, `step` defaults to `7200` seconds and has a maximum of `259200` seconds. Some endpoints use different defaults. Always follow the endpoint-specific schema.

---

# 4. Canisters

## GET `/api/v3/canisters`

List registered canisters.

```http
GET /api/v3/canisters
```

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `format` | string | `json` / `csv` |
| `subnet_id` | string | Filter by subnet |
| `limit` | integer | Default `50`, maximum `100` |
| `offset` | integer | Default `0` |
| `max_canister_index` | integer | Upper canister index |
| `has_name` | boolean | Only canisters with a name |
| `controller_id` | string | Filter by controller |
| `language` | enum | `c++`, `javascript`, `motoko`, `rust`, `typescript`, `python`, `solidity`, `unknown` |
| `sort_by` | string | `id`, `canister_id`, `controllers`, `subnet_id` |

Example:

```http
GET /api/v3/canisters?limit=100&has_name=true
```

### Response

The response contains:

```json
{
  "data": [],
  "previous_cursor": "...",
  "next_cursor": "..."
}
```

This endpoint is useful for **canister discovery**, but a canister is not automatically a token.

The official schema exposes `data`, `previous_cursor`, and `next_cursor`. citeturn0view0turn4view0

---

## GET `/api/v3/canisters/{canister_id}`

Get information about a single canister.

```http
GET /api/v3/canisters/{canister_id}
```

Example:

```http
GET /api/v3/canisters/aaaaa-aa
```

---

## GET `/api/v3/canisters/{canister_id}/name`

Get the registered name for a canister.

```http
GET /api/v3/canisters/{canister_id}/name
```

---

## GET `/api/v3/canisters-names`

Resolve names for multiple canisters.

```http
GET /api/v3/canisters-names?canister_ids=aaaaa-aa&canister_ids=...
```

The `canister_ids` query parameter is an array. citeturn0view0

---

## GET `/api/v3/canister-languages-summary`

Return the language distribution/summary of indexed canisters.

```http
GET /api/v3/canister-languages-summary
```

---

# 5. Canister count — v4

## GET `/api/v4/canisters/count`

Count canisters.

Useful filters include:

```text
subnet_id
has_name
controller_id
language[]
canister_type[]
query
node_class
```

### `canister_type`

The API defines:

```text
archive
btc_checker
dapp
faucet
governance
index
ledger
minter
orchestrator
root
swap
```

This is particularly interesting for ICP ecosystem discovery because the API can distinguish indexed **ledger**, **swap**, **root**, **governance**, etc. canister types.

The `query` parameter performs fuzzy search against canister name or canister ID. `node_class` supports `mainnet`, `cloud_engine`, and `all`; cloud-engine canisters are not exposed individually. citeturn0view0

---

## GET `/api/v4/canisters`

List canisters with v4 filtering.

This is the preferred endpoint when you need the richer v4 canister filters.

```http
GET /api/v4/canisters
```

Supported filter families include:

```text
subnet_id
has_name
controller_id
language[]
```

---

# 6. Block heights

## GET `/api/v3/block-heights`

Return current block height information.

Optional:

```text
subnet
```

---

## GET `/api/v3/block-heights-over-time`

Return block heights over time.

### Parameters

```text
subnet
start      required
end
step
```

Example:

```http
GET /api/v3/block-heights-over-time?start=1756684800&step=7200
```

---

# 7. ICP/USD

## GET `/api/v3/icp-usd-rate`

Return the current ICP/USD rate.

This is one of the most useful endpoints for ICPay.

```http
GET /api/v3/icp-usd-rate
```

Use it for:

```text
ICP price
USD conversion
market header
portfolio valuation
token USD conversion
```

---

# 8. ICP/XDR

## GET `/api/v3/icp-xdr-conversion-rates`

Return ICP/XDR conversion rates.

Parameters:

```text
format
start
end
step
```

Example:

```http
GET /api/v3/icp-xdr-conversion-rates?start=1756684800&end=1756771200&step=86400
```

---

## GET `/api/v3/avg-icp-xdr-conversion-rates`

Return average ICP/XDR conversion rates.

Parameters:

```text
format
start
end
step
```

---

# 9. Bitcoin integration metrics

The Dashboard API exposes Bitcoin-related network metrics.

## GET `/api/v3/bitcoin/main-chain-height`

Return Bitcoin main-chain height over time.

Parameters:

```text
format
start
end
step
network
```

`network`:

```text
mainnet
testnet
```

---

## GET `/api/v3/bitcoin/number-of-utxos`

Return Bitcoin UTXO count over time.

---

## GET `/api/v3/bitcoin/stable-memory-size-in-bytes`

Return Bitcoin integration stable-memory usage over time.

---

# 10. Network metrics

The API exposes a large metrics family under:

```text
/api/v3/metrics/*
```

Important metrics include:

```text
/api/v3/metrics/memory
/api/v3/metrics/ic-memory-usage
/api/v3/metrics/ic-memory-total
/api/v3/metrics/ic-nodes-count
/api/v3/metrics/ic-cpu-cores
/api/v3/metrics/ic-subnet-total
/api/v3/metrics/message-execution-rate
/api/v3/metrics/block-rate
/api/v3/metrics/registered-canisters-count
/api/v3/metrics/internet-identity-user-count
```

Most are time-series endpoints using:

```text
format
start
end
step
```

Some additionally support:

```text
subnet
```

---

# 11. Daily statistics

The API exposes daily network statistics under:

```text
/api/v3/daily-stats/*
```

One example is:

```http
GET /api/v3/daily-stats/max-query-transactions-per-sec-till-date
```

Typical parameters:

```text
format
start
end
step
```

Daily statistics are useful for historical network charts rather than real-time token prices.

---

# 12. Governance metrics

The API exposes NNS governance-related metrics.

Important families include:

```text
/api/v3/metrics/average-governance-voting-power-total
/api/v3/metrics/average-last-reward-event
/api/v3/metrics/community-fund-total-staked
/api/v3/metrics/last-reward-event
/api/v3/staking-metrics
```

These are useful for governance/network dashboards, not for DEX pricing.

---

# 13. Neurons

## GET `/api/v3/neurons`

List neurons.

The endpoint supports extensive filters for neuron state and maturity-related data.

Important filtering concepts include:

```text
max_neuron_index
only_with_eight_year_gang_bonus
include_state[]
```

Neuron states include:

```text
Dissolved
Dissolving
NotDissolving
Spawning
Unknown
Unspecified
```

---

## GET `/api/v3/neurons/{neuron_id}`

Retrieve an individual neuron.

---

# 14. Neuron voting powers

## GET `/api/v3/neuron-voting-powers`

Return neuron voting-power information.

This is useful for governance analytics.

---

## GET `/api/v4/neuron-voting-powers`

The v4 variant provides the newer voting-power interface.

---

# 15. Neuron maturity modulations

## GET `/api/v3/neuron-maturity-modulations`

Return neuron maturity modulation information.

Useful for historical governance/economic analytics.

---

# 16. Proposals

## GET `/api/v3/proposals`

List NNS proposals.

The API supports extensive proposal filters.

Important filter groups include:

```text
proposal_id
topic
status
start
end
```

The proposal topic enum includes:

```text
TOPIC_UNSPECIFIED
TOPIC_NEURON_MANAGEMENT
TOPIC_EXCHANGE_RATE
TOPIC_NETWORK_ECONOMICS
TOPIC_GOVERNANCE
TOPIC_NODE_ADMIN
TOPIC_PARTICIPANT_MANAGEMENT
TOPIC_SUBNET_MANAGEMENT
TOPIC_APPLICATION_CANISTER_MANAGEMENT
TOPIC_KYC
TOPIC_NODE_PROVIDER_REWARDS
TOPIC_SNS_DECENTRALIZATION_SALE
TOPIC_IC_OS_VERSION_DEPLOYMENT
TOPIC_IC_OS_VERSION_ELECTION
TOPIC_SNS_AND_COMMUNITY_FUND
TOPIC_API_BOUNDARY_NODE_MANAGEMENT
TOPIC_SUBNET_RENTAL
TOPIC_PROTOCOL_CANISTER_MANAGEMENT
TOPIC_SERVICE_NERVOUS_SYSTEM_MANAGEMENT
```

---

## GET `/api/v3/proposals/{proposal_id}`

Get one proposal.

```http
GET /api/v3/proposals/{proposal_id}
```

---

## GET `/api/v3/proposals-count`

Return proposal count.

---

## GET `/api/v3/latest-proposal-id`

Return the latest proposal ID.

---

# 17. Proposal analytics

The API also exposes proposal time-series and tally information through:

```text
/api/v3/proposals-over-time
/api/v3/proposal-tallies
/api/v3/proposal-deadline-extensions
```

Use these for governance charts and proposal analytics.

---

# 18. Nodes

## GET `/api/v3/nodes`

List IC nodes.

The API supports filters related to:

```text
data center
node provider
subnet
hardware generation
node status
reward type
node class
```

`node_class` supports:

```text
mainnet
cloud_engine
all
```

The `include_node_reward_type` filter can be used instead of `node_class`; the OpenAPI notes that these two filters are mutually exclusive. citeturn3view10

---

# 19. Node providers

## GET `/api/v3/node-providers`

List node providers.

Useful for:

```text
provider count
decentralization
node distribution
data-center analysis
```

---

## GET `/api/v3/node-providers-count`

Return node-provider count.

---

# 20. Data centers

## GET `/api/v3/data-centers`

List data centers.

---

## GET `/api/v3/data-centers-count`

Return data-center counts where supported.

---

# 21. Boundary nodes

## GET `/api/v3/boundary-node-locations`

Return boundary-node geographic information.

Supports:

```text
format=json
format=csv
```

---

## GET `/api/v4/boundary-node-data-centers`

Return boundary-node data-center information.

Response objects contain fields such as:

```text
dc_id
owner
region
name
latitude
longitude
total_nodes
```

The official schema exposes these fields directly. citeturn1view1

---

# 22. Subnets

## GET `/api/v3/subnets`

List subnet information.

Subnet objects can contain:

```text
subnet_id
subnet_type
subnet_specialization
display_name
up_nodes
total_nodes
running_canisters
stopped_canisters
total_canisters
total_countries
total_node_providers
memory_usage
instruction_rate
message_execution_rate
subnet_authorization
sev_enabled
decentralization_score
replica_versions
data_centers
```

The official schema exposes these network-health and decentralization fields. citeturn4view0

---

## GET `/api/v3/subnets/{subnet_id}`

Get a specific subnet.

---

## GET `/api/v4/subnets`

The v4 subnet API provides additional filtering.

Important filter concepts include:

```text
subnet type
subnet specialization
geographic / policy properties
node counts
```

The API defines subnet categories including:

```text
application
system
cloud_engine
```

and specializations such as:

```text
confidential
eu/eea
european
fiduciary
```

---

# 23. Subnet replica versions

## GET `/api/v3/subnet-replica-versions`

List replica versions associated with subnets.

---

## GET `/api/v3/subnet-replica-versions/{replica_version_id}`

Get one replica version.

---

# 24. Images

The API exposes generated image endpoints.

## GET `/api/v3/images/subnet-replica-versions/{replica_version_id}.png`

Retrieve an image associated with a replica version.

---

## GET `/api/v3/images/subnets/{subnet_id}.png`

Retrieve an image for a subnet.

---

## GET `/api/v3/images/accounts/{account_address}.png`

Retrieve an account image.

The official OpenAPI lists these under the `images` tag. citeturn3view2turn5view1

---

# 25. Health

## GET `/api/v3/health-check`

Check API health.

Use this for monitoring:

```text
ICPay backend
      ↓
health check
      ↓
Dashboard API available?
```

---

# 26. Network economics

The API exposes network-economics parameters through:

```text
/api/v3/network-economics-parameters
```

Use this for:

```text
transaction economics
subnet economics
network configuration
```

---

# 27. Participation rates

The API exposes participation-rate data:

```text
/api/v3/participation-rates
```

Useful for:

```text
governance
voting
network participation
```

---

# 28. Reward node providers

The API exposes reward-node-provider information through:

```text
/api/v3/reward-node-providers
```

Use this for node-provider reward analytics.

---

# 29. Root information

The API exposes root-related data under:

```text
/api/v3/root
```

Use this for ICP system/root-canister information exposed by the Dashboard API.

---

# 30. Deprecated API redirects

The current API includes deprecated legacy routes that redirect to v3 endpoints.

Examples:

```text
/api/metrics/memory
    → /api/v3/metrics/ic-memory-usage

/api/metrics/finalization-rate
    → /api/v3/metrics/block-rate

/api/metrics/registered-canisters
    → /api/v3/metrics/registered-canisters-count

/api/metrics/message-execution-rate
    → /api/v3/metrics/message-execution-rate

/api/node-list
    → /api/v3/nodes

/api/node-providers/list
    → /api/v3/node-providers

/api/subnet-list
    → /api/v3/subnets

/api/nns/proposals
    → /api/v3/proposals

/api/nns/proposals-count
    → /api/v3/proposals-count

/api/nns/voting-power
    → /api/v3/neuron-voting-powers

/api/nns/metrics
    → /api/v3/staking-metrics
```

These routes are marked `deprecated` in the official OpenAPI. Prefer the v3 endpoints directly. citeturn3view13turn5view0

---

# 31. Dashboard management — v4

The API also contains authenticated dashboard-management endpoints.

## POST `/api/v4/dashboards`

Create a dashboard.

Request body:

```json
{
  "...": "CreateDashboard schema"
}
```

Returns `201`.

---

## GET `/api/v4/dashboards`

List dashboards.

Filters include:

```text
search
is_public
is_favorite
sort_by
limit
after
before
```

Sorting supports:

```text
updated_at
-updated_at
name
-name
created_at
-created_at
```

---

## GET `/api/v4/dashboards/{dashboard_id}`

Get a dashboard.

Public dashboards can be accessed without the dashboard owner context.

---

## PUT `/api/v4/dashboards/{dashboard_id}`

Update a dashboard.

---

## DELETE `/api/v4/dashboards/{dashboard_id}`

Delete a dashboard.

---

## PUT `/api/v4/dashboards/{dashboard_id}/favorite`

Toggle favorite status.

---

## POST `/api/v4/dashboards/{dashboard_id}/duplicate`

Duplicate an existing dashboard.

The official OpenAPI defines these dashboard-management operations and uses UUID dashboard IDs. citeturn1view0turn4view0

---

# 32. User ICP accounts — v4

These endpoints are authenticated user-management APIs.

## POST `/api/v4/user-icp-accounts`

Create an ICP account for the authenticated user.

---

## GET `/api/v4/user-icp-accounts`

List the authenticated user's ICP accounts with linked neurons.

---

## DELETE `/api/v4/user-icp-accounts/{account_uuid}`

Delete an ICP account.

Links are cascade deleted.

---

# 33. User neurons — v4

## POST `/api/v4/user-neurons`

Create a neuron for the authenticated user.

Request:

```json
{
  "neuron_id": "...",
  "nickname": "..."
}
```

Both fields are required.

---

## GET `/api/v4/user-neurons`

List authenticated user's neurons with linked accounts.

---

## DELETE `/api/v4/user-neurons/{neuron_uuid}`

Delete a neuron.

Linked account relationships are cascade deleted.

---

# 34. User account-neuron links — v4

## POST `/api/v4/user-account-neuron-links`

Link an ICP account to a neuron.

Request:

```json
{
  "account_id": "...",
  "neuron_id": "...",
  "nickname": "..."
}
```

`account_id` and `neuron_id` are required.

---

## GET `/api/v4/user-account-neuron-links`

List account-neuron links for the authenticated user.

---

## DELETE `/api/v4/user-account-neuron-links/{link_uuid}`

Remove an account-neuron link.

The official API exposes these authenticated v4 user-management groups separately from the public network-data endpoints. citeturn4view0

---

# 35. Error format

The common API error schema is:

```json
{
  "code": 422,
  "status": "Unprocessable Entity",
  "message": "...",
  "errors": {}
}
```

The OpenAPI defines:

```text
Error
├── code
├── status
├── message
└── errors
```

`422` is explicitly defined as the validation error response across the API. citeturn1view1

---

# 36. ICPay — what to actually use

For your trading platform, **do not integrate every endpoint**.

Use this API as an ICP network/data source.

## P0 — Market infrastructure

```text
GET /api/v3/icp-usd-rate

GET /api/v3/canisters
GET /api/v3/canisters/{canister_id}
GET /api/v3/canisters/{canister_id}/name
GET /api/v3/canisters-names

GET /api/v4/canisters
GET /api/v4/canisters/count
```

The v4 canister filters are especially useful for finding canisters classified as:

```text
ledger
swap
index
minter
root
governance
dapp
```

However, **do not assume every `ledger` canister is a tradable ICRC token**. Verify the canister separately through its ICRC interface.

---

# 37. Recommended ICPay token discovery pipeline

```text
IC Public Dashboard API
          │
          ▼
     Canister Index
          │
          ├── canister_type = ledger
          │
          ▼
    Candidate Ledgers
          │
          ▼
     Query canister
          │
          ├── icrc1_name()
          ├── icrc1_symbol()
          ├── icrc1_decimals()
          ├── icrc1_total_supply()
          └── icrc1_metadata()
          │
          ▼
      Token Registry
          │
          ▼
       ICPay API
```

Then your own API can expose:

```http
GET /api/v1/markets/tokens
GET /api/v1/markets/tokens/new
GET /api/v1/markets/tokens/trending
GET /api/v1/markets/tokens/{canister_id}
```

The Dashboard API should therefore be considered an **upstream discovery/network-data source**, not the complete market-data source.

---

# 38. Recommended Go architecture

Keep the external integration isolated:

```text
internal/
├── icapi/
│   ├── client.go
│   ├── canisters.go
│   ├── metrics.go
│   ├── prices.go
│   └── subnets.go
│
├── token/
│   ├── discovery.go
│   ├── registry.go
│   └── service.go
│
├── market/
│   ├── service.go
│   └── repository.go
│
└── http/
    └── api/v1/
```

Do not scatter direct `ic-api.internetcomputer.org` calls throughout your handlers.

Use one reusable client:

```go
type Client struct {
    baseURL    string
    httpClient *http.Client
}
```

Then:

```go
type CanisterService struct {
    client *icapi.Client
}

type PriceService struct {
    client *icapi.Client
}
```

This keeps the external API replaceable without changing your market layer.

---

# 39. What this API does NOT provide

For your ICP trading platform, this distinction is critical.

This API does **not** provide a complete:

```text
❌ all ICRC token registry
❌ token price for every ICP token
❌ DEX liquidity
❌ pool TVL
❌ swap history for every DEX
❌ token market cap
❌ token holders for every ICRC ledger
❌ token trading volume
❌ new-token launch feed
```

For those, ICPay needs additional sources:

```text
IC Public Dashboard API
        +
ICRC ledger calls
        +
DEX/indexer data
        +
ICPay's own indexer
```

---

# 40. Quick endpoint map

| Area | Endpoint family | ICPay value |
|---|---|---:|
| ICP/USD | `/api/v3/icp-usd-rate` | ★★★★★ |
| Canisters | `/api/v3/canisters` | ★★★★★ |
| Canister details | `/api/v3/canisters/{id}` | ★★★★★ |
| Canister names | `/api/v3/canisters-names` | ★★★★☆ |
| Canister type/filter | `/api/v4/canisters` | ★★★★★ |
| Canister count | `/api/v4/canisters/count` | ★★★☆☆ |
| Block height | `/api/v3/block-heights` | ★★★★☆ |
| Metrics | `/api/v3/metrics/*` | ★★★☆☆ |
| Subnets | `/api/v3/subnets` | ★★☆☆☆ |
| Nodes | `/api/v3/nodes` | ★★☆☆☆ |
| NNS proposals | `/api/v3/proposals` | ★★☆☆☆ |
| Neurons | `/api/v3/neurons` | ★☆☆☆☆ |
| Bitcoin metrics | `/api/v3/bitcoin/*` | ★★☆☆☆ |
| Images | `/api/v3/images/*` | ★★☆☆☆ |
| Dashboard management | `/api/v4/dashboards/*` | Not market data |
| User accounts | `/api/v4/user-icp-accounts/*` | Not market data |
| User neurons | `/api/v4/user-neurons/*` | Not market data |

---

## Official source

urlICP Public Dashboard API OpenAPIhttps://ic-api.internetcomputer.org/api/v3/openapi.json

The current official specification identifies the service as **Public Dashboard API**, version **v3**, using OpenAPI **3.0.3**. citeturn4view0
