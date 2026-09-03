---
name: rust-canister
description: >-
  Rust CDK (ic-cdk) canister development for ICP — stable structures, async
  inter-canister calls, testing, upgrades, and ICPay trade-canister conventions.
  Read before writing or reviewing any Rust canister code (trade/, *.rs).
---

# Rust canisters on ICP (ICPay)

Official source: [DFINITY Rust CDK docs](https://github.com/dfinity/developer-docs/tree/main/docs/languages/rust).

Rust compiles to `wasm32-unknown-unknown`. Strong types and memory safety help build
reliable Wasm modules. **Language choice does not bypass IC consensus** — each
cross-canister **update** still costs ~2–4s. Speed comes from **fewer awaits**, not
Rust vs Motoko.

**ICPay context:** Rust trade canister lives at `backend/rust/trade/`. Wallet stays Motoko.

---

## Critical requirements

### NEVER use

| Forbidden | Why |
|-----------|-----|
| `tokio`, `async-std`, `rayon` | No OS threads / async runtimes in Wasm |
| `std::thread::sleep` | No blocking sleep — use `ic-cdk-timers` |
| `std::env::var` at runtime | Not available — use `env!()` at compile time |
| `reqwest`, `hyper` for on-chain HTTP | Use management canister HTTPS outcalls |
| `thread_local! { RefCell<HashMap<...>> }` for **persistent** data | Heap wiped on upgrade |
| `pre_upgrade` / `post_upgrade` as **sole** persistence for large state | Instruction limit can brick upgrades |
| `ic_cdk::println!` in production hot paths | Burns cycles; use sparingly |
| Browser `wasm-bindgen` crates | No JS host on IC |

### ALWAYS use

| Required | Detail |
|----------|--------|
| `ic-cdk` 0.19+ | Core CDK, macros re-exported |
| `candid` 0.10+ | Types + encoding for Candid |
| `ic-stable-structures` 0.7+ | Upgrade-safe storage |
| `crate-type = ["cdylib"]` | Produces Wasm module |
| `wasm32-unknown-unknown` target | `rustup target add wasm32-unknown-unknown` |
| `ic_cdk::export_candid!()` | At crate root — generates `.did` |
| `thread_local!` + `RefCell` + stable structures | Standard persistence pattern |
| `ic_cdk::futures::spawn` | Background work after reply |
| `Call::bounded_wait` | Inter-canister calls (not legacy `call`) |
| Distinct `MemoryId` per stable structure | Reusing IDs corrupts data |
| `Bound::Unbounded` for `Storable` custom types | Safe schema evolution |
| `Option<T>` for new fields | Old CBOR records deserialize as `None` |
| Unit tests + PocketIC integration tests | Every module with business logic |

---

## CDK crates

| Crate | Purpose |
|-------|---------|
| [`ic-cdk`](https://crates.io/crates/ic-cdk) | System API, inter-canister calls, state |
| [`ic-cdk-macros`](https://crates.io/crates/ic-cdk-macros) | `#[query]`, `#[update]`, lifecycle macros |
| [`ic-cdk-timers`](https://crates.io/crates/ic-cdk-timers) | One-shot and periodic timers |
| [`candid`](https://crates.io/crates/candid) | Candid serialization |
| [`ic-stable-structures`](https://crates.io/crates/ic-stable-structures) | Persistent stable memory types |

Common companions: `serde`, `ciborium` (CBOR for `Storable`), `async-trait` (test mocks).

---

## Project setup (ICPay / dfx)

### Prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install candid-extractor
```

### Minimal `Cargo.toml`

```toml
[package]
name = "trade_canister"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]
name = "trade_canister"

[dependencies]
ic-cdk = "0.19"
ic-stable-structures = "0.7"
candid = "0.10"
serde = { version = "1", features = ["derive"] }
ciborium = "0.2"

[dev-dependencies]
pocket-ic = "5"
```

### `dfx.json` canister entry

```json
"icpay_trade": {
  "type": "rust",
  "package": "trade_canister",
  "candid": "trade/trade_canister.did"
}
```

Workspace layout (ICPay):

```
backend/rust/trade/
├── Cargo.toml
├── trade_canister.did      # generated at build
└── src/
    ├── lib.rs              # macros, thread_local, export_candid!
    ├── api/                # thin #[query] / #[update] handlers
    ├── domain/             # pure logic (testable)
    ├── storage/            # StableBTreeMap wrappers
    ├── icpswap/            # external pool actors
    └── ledger/             # ICRC helpers
```

**Max ~300 lines per file** — split modules like Motoko services.

---

## Official example: counter canister

Minimal query + update (from DFINITY docs):

```rust
use std::cell::RefCell;

thread_local! {
    static COUNTER: RefCell<u64> = RefCell::new(0);
}

#[ic_cdk::query]
fn get() -> u64 {
    COUNTER.with(|c| *c.borrow())
}

#[ic_cdk::update]
fn increment() -> u64 {
    COUNTER.with(|c| {
        let mut val = c.borrow_mut();
        *val += 1;
        *val
    })
}

ic_cdk::export_candid!();
```

> **Note:** Heap `RefCell<u64>` survives update calls within a session but is **lost
> on upgrade**. Production canisters must use `StableCell` or `StableBTreeMap`.

---

## Canister macros

### Endpoint macros

| Macro | Description |
|-------|-------------|
| `#[ic_cdk::query]` | Read-only, no consensus, cannot mutate state |
| `#[ic_cdk::update]` | State change, goes through consensus |

Optional Candid name override:

```rust
#[ic_cdk::query(name = "greet")]
fn greet_user(name: String) -> String {
    format!("Hello, {name}!")
}
```

### Lifecycle macros

| Macro | When |
|-------|------|
| `#[ic_cdk::init]` | First install — initialize config |
| `#[ic_cdk::pre_upgrade]` | Before upgrade — avoid for large serialize |
| `#[ic_cdk::post_upgrade]` | After upgrade — re-init timers, transient state |

### System macros

| Macro | Purpose |
|-------|---------|
| `#[ic_cdk::heartbeat]` | Once per round — prefer `ic-cdk-timers` |
| `#[ic_cdk::inspect_message]` | Gate updates; `accept_message()` or trap |
| `export_candid!()` | Generate `.did` at module root |

### ICPay API result type (mirror Motoko `ApiResult`)

```rust
use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ApiResult<T> {
    Ok(T),
    Err(String),
}

impl<T> ApiResult<T> {
    pub fn ok(value: T) -> Self { ApiResult::Ok(value) }
    pub fn err(msg: impl Into<String>) -> Self { ApiResult::Err(msg.into()) }
}
```

Return `ApiResult<T>` from updates — never panic on user input.

---

## Async and inter-canister calls

Entry points may be `async`. Use the CDK executor only:

```rust
use candid::Principal;
use ic_cdk::call::Call;

#[ic_cdk::update]
async fn call_other(canister: Principal) -> String {
    Call::bounded_wait(canister, "greet")
        .with_arg("World")
        .await
        .expect("call failed")
        .candid::<(String,)>()
        .expect("decode failed")
        .0
}
```

Background work after replying:

```rust
#[ic_cdk::update]
async fn fire_and_forget() {
    ic_cdk::futures::spawn(async {
        // runs after response is sent
    });
}
```

### Parallel reads (same pattern as Motoko SwapService)

Dispatch independent calls **before** any `await`:

```rust
let fee_in_fut = ledger_fee(token_in);
let fee_out_fut = ledger_fee(token_out);
let pool_fut = resolve_pool(token_in, token_out);

let (fee_in, fee_out, pool) = (
    fee_in_fut.await,
    fee_out_fut.await,
    pool_fut.await,
);
```

**Writes stay sequential** — ledger transfers must settle in order.

### ICRC transfer example

```rust
#[ic_cdk::update]
async fn transfer_icrc(
    ledger: Principal,
    to: candid::Principal,
    amount: u64,
) -> Result<u64, String> {
    let args = (
        icrc1_transfer_args {
            to: Account { owner: to, subaccount: None },
            amount,
            fee: None,
            memo: None,
            from_subaccount: None,
            created_at_time: None,
        },
    );
    Call::bounded_wait(ledger, "icrc1_transfer")
        .with_arg(args)
        .await
        .map_err(|e| format!("transfer failed: {e:?}"))?
        .candid::<(Result<u64, TransferError>,)>()
        .map_err(|e| format!("decode failed: {e:?}"))?
        .0
        .map_err(|e| format!("ledger error: {e:?}"))
}
```

---

## Wasm limitations (official mapping)

| Need | Standard Rust | ICP equivalent |
|------|---------------|----------------|
| Threads | `std::thread`, `rayon` | `ic_cdk::futures::spawn` |
| Sleep | `thread::sleep` | `ic-cdk-timers` |
| Time | `Instant::now()` | `ic_cdk::api::time()` (nanoseconds) |
| Env vars | `std::env::var` | `env!()` / `option_env!()` at compile time |
| Random | `rand` | `ic_cdk::management_canister::raw_rand()` |
| HTTP | `reqwest` | HTTPS outcalls via management canister |

---

## Stable structures (persistence)

**Recommended for all ICPay Rust canisters.** Data in stable memory survives upgrades
without `pre_upgrade` serialization.

### When to use what

| Scenario | Use |
|----------|-----|
| User balances, orders, config | `StableBTreeMap`, `StableCell` |
| Append-only audit / trade log | `StableLog` |
| Large growable lists by index | `StableVec` |
| Single counter / flag | `StableCell` |
| Cache rebuildable after upgrade | Heap `HashMap` in `post_upgrade` |
| Temp computation in one call | Heap `Vec` |

### `Storable` for custom types (official pattern)

```rust
use ic_stable_structures::storable::{Bound, Storable};
use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct User {
    id: u64,
    name: String,
    created_at: u64,
    email: Option<String>, // new field — old records = None
}

impl Storable for User {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("encode User");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("encode User");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("decode User")
    }
}
```

### MemoryManager wiring (official pattern)

```rust
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell,
};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const USERS_MEM_ID: MemoryId = MemoryId::new(0);
const COUNTER_MEM_ID: MemoryId = MemoryId::new(1);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERS: RefCell<StableBTreeMap<u64, User, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEM_ID))
        ));

    static COUNTER: RefCell<StableCell<u64, Memory>> =
        RefCell::new(StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(COUNTER_MEM_ID)),
            0u64,
        ).expect("failed to init COUNTER"));
}

#[ic_cdk::init]
fn init() {}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    // Re-register ic-cdk-timers here — timers do not survive upgrades
}
```

### Stable memory rules

1. **Never reuse `MemoryId`** — corrupts both structures
2. **Never renumber IDs** after mainnet deploy — add new IDs only
3. **Never change map key type** in place — migrate to new `MemoryId`
4. **`StableLog` needs two IDs** — index + data
5. Define `#[post_upgrade]` if using timers (they stop after upgrade)

### Verify persistence locally

```bash
dfx deploy icpay_trade
dfx canister call icpay_trade add_user '("Alice")'
dfx deploy icpay_trade   # upgrade
dfx canister call icpay_trade get_user_count '()'
# count must be unchanged
```

---

## Timers (limit orders, heartbeat)

Use `ic-cdk-timers`, not `#[heartbeat]` for scheduled work:

```rust
use ic_cdk_timers::{set_timer, set_timer_interval};
use std::time::Duration;

#[ic_cdk::init]
fn init() {
    set_timer_interval(Duration::from_secs(2), || {
        ic_cdk::futures::spawn(async {
            process_open_limit_orders().await;
        });
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    init(); // re-register timers
}
```

---

## Testing (official patterns)

### Layer 1 — Unit tests (pure Rust, milliseconds)

Isolate `ic_cdk` behind traits. Business logic takes `&CanisterApi` with `Arc<dyn Trait>`.

```rust
// domain/order.rs — no ic_cdk imports
pub fn min_out(amount_out: u64, slippage_bps: u16) -> u64 {
    amount_out.saturating_mul(10_000 - slippage_bps as u64) / 10_000
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slippage_one_percent() {
        assert_eq!(min_out(1_000_000, 100), 990_000);
    }
}
```

```rust
// Mock inter-canister API for tests
#[cfg(test)]
pub mod test_util {
    use super::*;
    use std::sync::{Arc, Mutex};

    pub struct TestCounter {
        count: Arc<Mutex<u64>>,
    }

    impl Counter for TestCounter {
        fn get_count(&self) -> u64 { *self.count.lock().unwrap() }
        fn increment_count(&self) -> u64 {
            let mut g = self.count.lock().unwrap();
            *g += 1;
            *g
        }
    }
}
```

Run: `cargo test` from `trade/`.

### Layer 2 — PocketIC integration tests

Deploy real Wasm, call endpoints:

```rust
// tests/integration/trade.rs
use pocket_ic::PocketIc;

#[test]
fn quote_returns_ok() {
    let pic = PocketIc::new();
    // deploy wasm, call get_quote, assert ApiResult::Ok
}
```

Reference: [dfinity/examples — unit_testable_rust_canister](https://github.com/dfinity/examples/tree/master/rust/unit_testable_rust_canister)

### ICPay testing rules

- Every `domain/` function with logic → `#[cfg(test)]` module
- Every public `#[update]` → integration test in `tests/`
- Add `trade:test` to CI before mainnet deploy
- Never skip failing tests

---

## ICPay Rust coding standard

### Naming

| Item | Convention | Example |
|------|------------|---------|
| Crate | `snake_case` | `trade_canister` |
| Module file | `snake_case.rs` | `order_book.rs` |
| Types | `PascalCase` | `MarketOrder`, `ApiResult` |
| Functions | `snake_case` | `execute_market`, `get_quote` |
| Constants | `SCREAMING_SNAKE` | `MAX_SLIPPAGE_BPS` |
| Candid methods | `snake_case` | `get_quote`, `execute_market` |

### Layering (mirror Motoko)

```
api/        → #[query] / #[update] only — auth check, delegate
domain/     → business logic — no ic_cdk in pure functions
storage/    → StableBTreeMap access
icpswap/    → external actor calls
ledger/     → ICRC transfers
```

No business logic in `lib.rs` beyond wiring and `thread_local!`.

### Security (custodial trade canister)

| Rule | Implementation |
|------|----------------|
| Caller auth | `ic_cdk::caller()` on user endpoints |
| Wallet-only credit | `credit_from_wallet` checks `caller == WALLET_ID` |
| No anonymous | Reject `Principal::anonymous()` |
| Slippage | Pass `min_out` to pool `swap` |
| Rate limits | Per-principal window in stable memory |
| Reconcile | `sum(balances) <= on_chain_main_balance` |

### Errors

- User-facing: `ApiResult::Err("clear message")`
- Programmer bugs: `trap` / `expect` only for invariants
- Inter-canister: map to `String` with context — never silent `?` to trap on user path

---

## Full canister template (production-shaped)

```rust
mod api;
mod domain;
mod storage;

use candid::CandidType;
use candid::Principal;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ApiResult<T> {
    Ok(T),
    Err(String),
}

thread_local! {
    static WALLET_CANISTER: RefCell<Option<Principal>> = RefCell::new(None);
}

#[ic_cdk::init]
fn init(wallet: Principal) {
    WALLET_CANISTER.with(|w| *w.borrow_mut() = Some(wallet));
}

#[ic_cdk::post_upgrade]
fn post_upgrade(wallet: Principal) {
    WALLET_CANISTER.with(|w| *w.borrow_mut() = Some(wallet));
    api::timers::start();
}

#[ic_cdk::query]
fn get_quote(token_in: String, token_out: String, amount_in: u64) -> ApiResult<domain::Quote> {
    domain::quote::compute(token_in, token_out, amount_in)
        .map(ApiResult::Ok)
        .map_err(ApiResult::Err)
        .unwrap_or_else(|e| ApiResult::Err(e))
}

#[ic_cdk::update]
async fn execute_market(
    token_in: String,
    token_out: String,
    amount_in: u64,
    min_out: u64,
) -> ApiResult<domain::OrderView> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return ApiResult::Err("Not authenticated".into());
    }
    api::market::execute(caller, token_in, token_out, amount_in, min_out).await
}

ic_cdk::export_candid!();
```

---

## Build and deploy (ICPay)

```bash
# Local
cd trade && cargo build --target wasm32-unknown-unknown --release
cd ../backend && dfx deploy icpay_trade --network local

# Mainnet — human only, never from CI
cd /path/to/icppay
npm run ci backend:deploy   # wallet only today
# trade canister: add deploy recipe to ci/ when ready
```

Shrink Wasm in production (`shrink: true` in icp.yaml / dfx rust config).

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `HashMap` in `thread_local!` for balances | `StableBTreeMap` |
| Reused `MemoryId` | Named constants, never reuse |
| Forgot `post_upgrade` timer re-init | Timers silently stop |
| `tokio::spawn` in canister | `ic_cdk::futures::spawn` |
| Giant `lib.rs` | Split `api/`, `domain/`, `storage/` |
| No `export_candid!()` | Frontend cannot generate actor |
| Trapping on bad user input | Return `ApiResult::Err` |
| Sequential pool tier lookup | `futures::join!` or spawn all then await |

---

## Task router

| Task | Read |
|------|------|
| New Rust canister crate | This skill + `docs/trade/plan1/readme` |
| Persistent storage | § Stable structures above |
| Inter-canister / ICRC | § Async + ledger example |
| Limit order heartbeat | § Timers |
| Unit test business logic | § Testing layer 1 |
| Integration test | § Testing layer 2 + PocketIC |
| Wallet ↔ trade boundary | `docs/trade/plan1/readme` §8 |
| Motoko wallet changes | `skills/integration-standard/SKILL.md` |
| Mainnet deploy | `.claude/skills/icpay-ops/SKILL.md` |

---

## Official further reading

| Resource | URL |
|----------|-----|
| Rust CDK index | https://github.com/dfinity/developer-docs/blob/main/docs/languages/rust/index.md |
| Stable structures | https://github.com/dfinity/developer-docs/blob/main/docs/languages/rust/stable-structures.md |
| Testing Rust canisters | https://github.com/dfinity/developer-docs/blob/main/docs/languages/rust/testing.md |
| `ic-cdk` API docs | https://docs.rs/ic-cdk |
| `ic-stable-structures` API | https://docs.rs/ic-stable-structures |
| `ic-cdk-timers` API | https://docs.rs/ic-cdk-timers |
| Data persistence guide | https://github.com/dfinity/developer-docs/blob/main/docs/guides/backends/data-persistence.md |
| Runnable example | https://github.com/dfinity/examples/tree/master/rust/unit_testable_rust_canister |
| ICPay transfer perf | `docs/icpay/Transfer-Performance.md` |

---

## Schema evolution checklist

Before any mainnet upgrade that changes stored types:

- [ ] New fields are `Option<T>` or have defaults
- [ ] `BOUND` stays `Unbounded` unless bounded size is proven fixed forever
- [ ] Key type unchanged OR new `MemoryId` + migration in `post_upgrade`
- [ ] `MemoryId` list documented in `storage/mod.rs` comments
- [ ] Upgrade tested: write data → deploy → read data
- [ ] Timers re-registered in `post_upgrade`
