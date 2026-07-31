# Build

## Flow

```text
scripts/packtool.sh          → moc package paths
        ↓
moc 1.7.0 -c
  --package src ./src
  --enhanced-migration src/migrations
  --default-persistent-actors
  --actor-idl .dfx/local/canisters/idl
  --actor-alias icrc1_ledger <id>
  --actor-alias icp_index <id>
  -o .mops/.build/lottery.wasm
  --idl
```

## Commands

```bash
# 1. Tests (local backend/ folder required)
bash scripts/run-tests.sh

# 2. Build wasm (mainnet ledger IDs by default)
DFX_NETWORK=ic bash scripts/build-lottery.sh

# Local build (local ledger alias)
DFX_NETWORK=local bash scripts/build-lottery.sh
```

## mops.toml essentials

```toml
[toolchain]
moc = "1.7.0"

[moc]
args = ["--default-persistent-actors"]

[canisters.lottery]
main = "src/main.mo"
args = [
  "--actor-alias", "icrc1_ledger", "ryjl3-tyaaa-aaaaa-aaaba-cai",
  "--actor-alias", "icp_index", "qhbym-qaaaa-aaaaa-aaafq-cai",
]

[canisters.lottery.migrations]
chain = "src/migrations"
```

## Actor IDL (external canisters)

Build script fetches ICRC ledger `.did` if missing:

```bash
dfx canister --network ic metadata ryjl3-tyaaa-aaaaa-aaaba-cai candid:service
```

Local:

```bash
dfx build icrc1_ledger
```

## Output artifacts

| File | Purpose |
|------|---------|
| `.mops/.build/lottery.wasm` | Install / upgrade |
| `.mops/.build/lottery.did` | Candid — sync to `frontend/lib/lottery/idl.ts` |
