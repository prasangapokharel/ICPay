# Motoko + ICP Tokens — Complete Reference

Sources (official):
- Motoko language docs — https://internetcomputer.org/docs/current/motoko/main/motoko
- ICP Developer Docs — https://docs.internetcomputer.org/
- ICRC-1 spec (dfinity/ICRC-1 repo) — https://github.com/dfinity/ICRC-1
- ICRC-2 spec (approve/transfer_from) — https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2
- Token transfer sample (official) — https://docs.internetcomputer.org/references/samples/motoko/token_transfer/
- ICP transfer sample (official) — https://docs.internetcomputer.org/references/samples/motoko/icp_transfer/
- NatLabs ICRC-1 implementation — https://github.com/NatLabs/icrc1
- Motoko Book (community, widely used) — https://motoko-book.dev/

---

## 1. What Motoko Is

Motoko is DFINITY's language for writing **canisters** (smart contracts) on the Internet Computer (ICP). A canister is written as an `actor`. Public functions are either:

- `shared func` — an **update call** (mutates state, goes through consensus, costs cycles)
- `shared query func` — a **query call** (fast, read-only, not replicated by default)

```motoko
actor Counter {
  stable var count : Nat = 0;

  public shared func increment() : async Nat {
    count += 1;
    count
  };

  public query func get() : async Nat {
    count
  };
};
```

`stable var` survives canister upgrades (`dfx deploy` with `--mode upgrade`); plain `var`/`let` do not.

---

## 2. The ICRC-1 Fungible Token Standard

ICRC-1 ("Internet Computer Request for Comments #1") is the standard interface every fungible token ledger on ICP should implement — it's how ckBTC, ckETH, SNS tokens, and most custom tokens work. The ICP native ledger also implements ICRC-1.

### 2.1 Core types

```motoko
type Account = {
  owner : Principal;
  subaccount : ?Blob;   // 32-byte blob, lets one principal hold many balances
};

type Timestamp = Nat64;   // nanoseconds since Unix epoch
type Duration  = Nat64;
type BlockIndex = Nat;

type TransferArg = {
  from_subaccount : ?Blob;
  to : Account;
  amount : Nat;
  fee : ?Nat;
  memo : ?Blob;
  created_at_time : ?Timestamp;
};

type TransferError = {
  #BadFee : { expected_fee : Nat };
  #BadBurn : { min_burn_amount : Nat };
  #InsufficientFunds : { balance : Nat };
  #TooOld;
  #CreatedInFuture : { ledger_time : Timestamp };
  #Duplicate : { duplicate_of : BlockIndex };
  #TemporarilyUnavailable;
  #GenericError : { error_code : Nat; message : Text };
};

type Result = {
  #Ok : BlockIndex;
  #Err : TransferError;
};
```

### 2.2 Required ledger methods

| Method | Type | Purpose |
|---|---|---|
| `icrc1_name` | query | Token name |
| `icrc1_symbol` | query | Token ticker |
| `icrc1_decimals` | query | Divisibility (e.g. `8`) |
| `icrc1_fee` | query | Default transfer fee |
| `icrc1_metadata` | query | Key/value metadata list |
| `icrc1_total_supply` | query | Circulating supply |
| `icrc1_minting_account` | query | Optional minting account |
| `icrc1_balance_of` | query | Balance of an `Account` |
| `icrc1_transfer` | update | Move tokens between accounts |
| `icrc1_supported_standards` | query | List of standards implemented (ICRC-1, ICRC-2, ICRC-3…) |

Full spec: https://github.com/dfinity/ICRC-1

---

## 3. Deploying a Local ICRC-1 Ledger (for testing)

```bash
dfx start --clean --background
dfx new icrc1_ledger_canister
cd icrc1_ledger_canister
# choose "Motoko" when prompted for the backend language
```

Download the ledger Wasm + Candid for a pinned IC revision, then set `dfx.json`:

```json
{
  "canisters": {
    "icrc1_ledger_canister": {
      "type": "custom",
      "candid": "https://raw.githubusercontent.com/dfinity/ic/<REVISION>/rs/rosetta-api/icrc1/ledger/ledger.did",
      "wasm": "https://download.dfinity.systems/ic/<REVISION>/canisters/ic-icrc1-ledger.wasm.gz"
    }
  }
}
```

Deploy with init args (minting account, initial balances, name/symbol/decimals/fee):

```bash
dfx deploy icrc1_ledger_canister --argument "(variant { Init =
  record {
    token_symbol = \"MTK\";
    token_name = \"My Token\";
    minting_account = record { owner = principal \"$(dfx identity get-principal)\" };
    transfer_fee = 10_000;
    metadata = vec {};
    initial_balances = vec {
      record { record { owner = principal \"$(dfx identity get-principal)\"; }; 100_000_000_000; };
    };
    archive_options = record {
      num_blocks_to_archive = 1000;
      trigger_threshold = 2000;
      controller_id = principal \"$(dfx identity get-principal)\";
      cycles_for_archive_creation = opt 10_000_000_000_000;
    };
  }
})"
```

Check a balance:

```bash
dfx canister call icrc1_ledger_canister icrc1_balance_of \
  "(record { owner = principal \"$(dfx identity get-principal)\"; })"
```

Reference: https://internetcomputer.org/docs/current/tutorials/developer-journey/level-4/4.2-icrc-tokens

---

## 4. Creating Your Own Token Canister (mint + supply)

You can either wire up the official ledger Wasm above (recommended, battle-tested), or build a lightweight token actor using an existing Motoko library via [mops](https://mops.one) (the Motoko package manager).

```bash
mops add icrc1
```

```motoko
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Token "mo:icrc1/ICRC1/Canisters/Token";

actor {
  let decimals = 8;
  func add_decimals(n : Nat) : Nat { n * 10 ** decimals };

  let pre_mint_account = {
    owner = Principal.fromText("<YOUR_PRINCIPAL>");
    subaccount = null;
  };

  let token_canister = Token.Token({
    name = "My Token";
    symbol = "MTK";
    decimals = Nat8.fromNat(decimals);
    fee = add_decimals(1);
    max_supply = add_decimals(1_000_000);
    initial_balances = [(pre_mint_account, add_decimals(100_000))];
    min_burn_amount = add_decimals(10);
    minting_account = null; // defaults to the canister's own id
    advanced_settings = null;
  });
};
```

Source: https://mops.one/icrc1 (NatLabs implementation, ICDevs/DFINITY funded).

---

## 5. Transferring ICRC-1 Tokens FROM a Canister (official sample)

This is DFINITY's official `token_transfer` example — a canister that holds tokens and sends them out on request.

```bash
dfx new --type=motoko token_transfer --no-frontend
cd token_transfer
```

`dfx.json`:

```json
{
  "canisters": {
    "token_transfer_backend": {
      "main": "src/token_transfer_backend/main.mo",
      "type": "motoko",
      "dependencies": ["icrc1_ledger_canister"]
    },
    "icrc1_ledger_canister": {
      "type": "custom",
      "candid": "https://raw.githubusercontent.com/dfinity/ic/<REVISION>/rs/rosetta-api/icrc1/ledger/ledger.did",
      "wasm": "https://download.dfinity.systems/ic/<REVISION>/canisters/ic-icrc1-ledger.wasm.gz"
    }
  }
}
```

`src/token_transfer_backend/main.mo`:

```motoko
import Icrc1Ledger "canister:icrc1_ledger_canister";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Error "mo:base/Error";

actor {
  type TransferArgs = {
    amount : Nat;
    toAccount : Icrc1Ledger.Account;
  };

  public shared func transfer(args : TransferArgs) : async Result.Result<Icrc1Ledger.BlockIndex, Text> {
    Debug.print(
      "Transferring " # debug_show (args.amount) # " tokens to account" # debug_show (args.toAccount)
    );

    let transferArgs : Icrc1Ledger.TransferArg = {
      memo = null;
      amount = args.amount;
      from_subaccount = null;   // send from the canister's default subaccount
      fee = null;               // let the ledger apply its default fee
      to = args.toAccount;
      created_at_time = null;
    };

    try {
      let transferResult = await Icrc1Ledger.icrc1_transfer(transferArgs);

      switch (transferResult) {
        case (#Err(transferError)) {
          return #err("Couldn't transfer funds:\n" # debug_show (transferError));
        };
        case (#Ok(blockIndex)) { return #ok blockIndex };
      };
    } catch (error : Error) {
      return #err("Reject message: " # Error.message(error));
    };
  };
};
```

Deploy + fund + call:

```bash
dfx start --background
dfx deploy
# ...fund the token_transfer_backend canister's account via icrc1_transfer from your identity...
dfx canister call token_transfer_backend transfer \
  "(record { amount = 10_000; toAccount = record { owner = principal \"<RECEIVER_PRINCIPAL>\" } })"
```

Official source: https://docs.internetcomputer.org/references/samples/motoko/token_transfer/

---

## 6. Transferring Native ICP (legacy ledger, `icp_transfer` sample)

The ICP ledger canister (`ryjl3-tyaaa-aaaaa-aaaba-cai` on mainnet) also supports ICRC-1, but historically exposes a `transfer` method using `AccountIdentifier` (a hashed 32-byte account, distinct from the ICRC-1 `Account` record).

```bash
dfx new --type=motoko icp_transfer --no-frontend
cd icp_transfer
```

`dfx.json` (local testing, custom ledger wasm pinned to a revision; production uses the `remote.id.ic` alias below):

```json
{
  "canisters": {
    "icp_transfer_backend": {
      "main": "src/icp_transfer_backend/main.mo",
      "type": "motoko",
      "dependencies": ["icp_ledger_canister"]
    },
    "icp_ledger_canister": {
      "type": "custom",
      "candid": "https://raw.githubusercontent.com/dfinity/ic/<REVISION>/rs/rosetta-api/icp_ledger/ledger.did",
      "wasm": "https://download.dfinity.systems/ic/<REVISION>/canisters/ledger-canister.wasm.gz",
      "remote": { "id": { "ic": "ryjl3-tyaaa-aaaaa-aaaba-cai" } }
    }
  }
}
```

Because the ICP ledger implements ICRC-1, you can reuse the exact same `icrc1_transfer` pattern from Section 5 against `icp_ledger_canister` instead of a custom token ledger — this is now DFINITY's recommended approach over the legacy `AccountIdentifier`-based `transfer` method.

Official source: https://docs.internetcomputer.org/references/samples/motoko/icp_transfer/

---

## 7. ICRC-2: Approve / TransferFrom (spender workflow)

ICRC-2 extends ICRC-1 with an allowance model (like ERC-20's `approve`/`transferFrom`), letting one account authorize another (e.g. a DEX canister) to move a capped amount of tokens on its behalf.

```motoko
type ApproveArgs = {
  from_subaccount : ?Blob;
  spender : Account;
  amount : Nat;
  expected_allowance : ?Nat;
  expires_at : ?Timestamp;
  fee : ?Nat;
  memo : ?Blob;
  created_at_time : ?Timestamp;
};

type ApproveError = {
  #BadFee : { expected_fee : Nat };
  #InsufficientFunds : { balance : Nat };
  #AllowanceChanged : { current_allowance : Nat };
  #Expired : { ledger_time : Nat64 };
  #TooOld;
  #CreatedInFuture : { ledger_time : Nat64 };
  #Duplicate : { duplicate_of : Nat };
  #TemporarilyUnavailable;
  #GenericError : { error_code : Nat; message : Text };
};

type TransferFromArgs = {
  spender_subaccount : ?Blob;
  from : Account;
  to : Account;
  amount : Nat;
  fee : ?Nat;
  memo : ?Blob;
  created_at_time : ?Timestamp;
};
```

Typical flow used in swap/DeFi canisters (e.g. the official "5.3 Creating a decentralized token swap" tutorial):

```motoko
import Token "canister:token_a";

actor Swap {
  // Step 1: user calls icrc2_approve on the token ledger directly, naming
  // this Swap canister's principal as spender — done client-side, not here.

  // Step 2: this canister pulls the approved funds into itself.
  public shared ({ caller }) func deposit(amount : Nat) : async Result.Result<Nat, Text> {
    let args : Token.TransferFromArgs = {
      spender_subaccount = null;
      from = { owner = caller; subaccount = null };
      to = { owner = Principal.fromActor(Swap); subaccount = null };
      amount = amount;
      fee = null;
      memo = null;
      created_at_time = null;
    };
    switch (await Token.icrc2_transfer_from(args)) {
      case (#Ok(blockIndex)) #ok(blockIndex);
      case (#Err(e)) #err(debug_show (e));
    };
  };
};
```

Spec: https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2
Full tutorial: https://docs.internetcomputer.org/tutorials/developer-liftoff/level-5/5.3-token-swap-tutorial

---

## 8. Checking Balances & Supply (any ICRC-1 ledger)

```motoko
import Ledger "canister:icrc1_ledger_canister";

actor {
  public func myBalance(owner : Principal) : async Nat {
    await Ledger.icrc1_balance_of({ owner; subaccount = null });
  };

  public func supply() : async Nat {
    await Ledger.icrc1_total_supply();
  };

  public func fee() : async Nat {
    await Ledger.icrc1_fee();
  };
};
```

CLI equivalents:

```bash
dfx canister call icrc1_ledger_canister icrc1_balance_of \
  "(record { owner = principal \"<PRINCIPAL>\"; })"

dfx canister call icrc1_ledger_canister icrc1_total_supply
dfx canister call icrc1_ledger_canister icrc1_fee
dfx canister call icrc1_ledger_canister icrc1_metadata
```

---

## 9. Handling Every `TransferError` Case (defensive pattern)

Always exhaustively match `TransferError` so failures are surfaced, not silently swallowed:

```motoko
switch (await Ledger.icrc1_transfer(args)) {
  case (#Ok(blockIndex))              { /* success, record blockIndex */ };
  case (#Err(#BadFee(e)))             { /* resend with e.expected_fee */ };
  case (#Err(#BadBurn(e)))            { /* amount below e.min_burn_amount */ };
  case (#Err(#InsufficientFunds(e)))  { /* caller's balance is e.balance */ };
  case (#Err(#TooOld))                { /* created_at_time too far in the past */ };
  case (#Err(#CreatedInFuture(e)))    { /* clock skew vs e.ledger_time */ };
  case (#Err(#Duplicate(e)))          { /* already submitted, see e.duplicate_of */ };
  case (#Err(#TemporarilyUnavailable)){ /* ledger under load, retry */ };
  case (#Err(#GenericError(e)))       { /* e.error_code / e.message */ };
};
```

Ensuring a transfer actually happened:
1. Read the returned `BlockIndex` — it's the ledger's ground-truth receipt.
2. Poll `icrc1_balance_of` on both accounts before/after to confirm the delta.
3. For idempotency, always set `created_at_time` and reuse the same `memo`/args on retry so the ledger can return `#Duplicate` instead of double-spending.

---

## 10. Quick Reference — dfx Commands

```bash
dfx start --clean --background        # local replica
dfx deploy                            # deploy all canisters in dfx.json
dfx deploy <canister> --mode upgrade  # preserve stable vars across upgrade
dfx canister call <canister> <method> "(args)"
dfx canister id <canister>
dfx identity get-principal
dfx ledger balance                    # native ICP balance of current identity
```

---

## 11. Further Reading (official)

- Motoko language manual — https://internetcomputer.org/docs/current/motoko/main/motoko
- ICRC-1 standard repo — https://github.com/dfinity/ICRC-1
- ICRC-2 standard — https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2
- Ledger local setup guide — https://internetcomputer.org/docs/current/developer-docs/defi/icrc-1/icrc1-ledger-setup
- dfinity/examples (all official sample canisters, Motoko + Rust) — https://github.com/dfinity/examples
- NatLabs ICRC-1 Motoko implementation — https://github.com/NatLabs/icrc1
- Motoko Book (community reference, ICRC-1/ledger chapters) — https://motoko-book.dev/