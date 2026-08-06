import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Config "../../src/config/Config";
import LedgerTypes "../../src/ledger/Types";
import TokenService "../../src/services/TokenService";

// The install argument is only exercised for real by a mainnet launch, and a
// launch charges 5 ICP before the canister exists. So the shape is pinned here
// against ledger.did from ledger-suite-icrc-2026-03-09 instead of being
// discovered by a creator who paid and got a trap.

let creator = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

let params = {
  name = "My Token";
  symbol = "MTK";
  description = "a token";
  logo = ?"data:image/png;base64,AA";
  website = ?"https://example.com";
  telegram = null : ?Text;
  twitter = null : ?Text;
  decimals = 8 : Nat8;
  totalSupply = 1_000_000 : Nat;
  immutable = true;
};

let args = TokenService.ledgerInitArgs(creator, params, "MTK");

assert (args.token_name == "My Token");
assert (args.token_symbol == "MTK");
assert (args.decimals == ?8);
// The whole supply goes to the creator, who is also the minting account, so
// nobody but them can mint after launch.
assert (args.minting_account.owner == creator);
assert (args.initial_balances.size() == 1);
assert (args.initial_balances[0].1 == 1_000_000);
Debug.print("PASS: supply and minting account both belong to the creator");

// A zero here means the ledger cannot spawn its archive once trigger_threshold
// is crossed, and it silently keeps every block in its own memory instead.
assert (args.archive_options.cycles_for_archive_creation == ?Config.ARCHIVE_CREATION_CYCLES);
assert (Config.ARCHIVE_CREATION_CYCLES > 0);
assert (args.archive_options.controller_id == creator);
assert (args.archive_options.trigger_threshold > args.archive_options.num_blocks_to_archive);
Debug.print("PASS: the archive is fundable and controlled by the creator");

// Fields ledger.did declares that an earlier version of this record omitted.
// Absent optionals are fine to send; a missing field is not.
assert (args.fee_collector_account == null);
assert (args.max_memo_length == null);
assert (args.index_principal == null);
assert (args.archive_options.max_message_size_bytes == null);
assert (args.archive_options.node_max_memory_size_bytes == null);
assert (args.archive_options.max_transactions_per_response == null);
assert (args.archive_options.more_controller_ids == null);
Debug.print("PASS: every field ledger.did declares is present");

// The real check, and the reason this file exists. Transcribed by hand from
// ledger.did rather than imported, so it cannot drift along with the source: if
// TokenService's record stops matching the release, this stops compiling.
// to_candid is unavailable under the interpreter, so the guarantee is structural
// -- which is stronger anyway, being checked rather than round-tripped.
type DidAccount = { owner: Principal; subaccount: ?Blob };
type DidInitArgs = {
  minting_account: DidAccount;
  fee_collector_account: ?DidAccount;
  transfer_fee: Nat;
  decimals: ?Nat8;
  max_memo_length: ?Nat16;
  token_symbol: Text;
  token_name: Text;
  metadata: [(Text, LedgerTypes.Value)];
  initial_balances: [(DidAccount, Nat)];
  feature_flags: ?{ icrc2: Bool };
  archive_options: {
    num_blocks_to_archive: Nat64;
    max_transactions_per_response: ?Nat64;
    trigger_threshold: Nat64;
    max_message_size_bytes: ?Nat64;
    cycles_for_archive_creation: ?Nat64;
    node_max_memory_size_bytes: ?Nat64;
    controller_id: Principal;
    more_controller_ids: ?[Principal];
  };
  index_principal: ?Principal;
};

// The ledger's entry point is `(ledger_arg : LedgerArg)` where LedgerArg is
// `variant { Init; Upgrade }`. Encoding InitArgs bare decodes as neither and
// traps the install -- after the fee is taken and the canister exists.
type DidLedgerArg = { #Init: DidInitArgs };

let checked: DidInitArgs = args;
assert (checked.token_symbol == "MTK");

// metadata is typed with our own Value, which is wider than the did's
// MetadataValue -- it also carries #Array and #Map. Either one encodes fine on
// our side and then fails to decode on the ledger's, trapping the install after
// the fee is taken, so no metadata entry may use them.
for ((_, v) in args.metadata.values()) {
  switch (v) {
    case (#Nat(_) or #Int(_) or #Text(_) or #Blob(_)) {};
    case (_) { assert false };
  };
};
assert (args.metadata.size() == 5);
Debug.print("PASS: every metadata value is one the did's MetadataValue accepts");

let wrapped: DidLedgerArg = #Init(args);
switch (wrapped) {
  case (#Init(back)) {
    assert (back.initial_balances[0].1 == 1_000_000);
    assert (back.archive_options.cycles_for_archive_creation == ?Config.ARCHIVE_CREATION_CYCLES);
  };
};
Debug.print("PASS: the record matches ledger.did and wraps as variant { Init }");

// icrc2 is on: without it no token launched here can be used with an approve
// or transfer_from, which is most of what a DEX or escrow needs.
assert (args.feature_flags == ?{ icrc2 = true });
assert (args.transfer_fee == 10_000);
Debug.print("PASS: icrc2 is enabled and the transfer fee is set");

Debug.print("ALL LEDGER INIT ARG TESTS PASSED");
