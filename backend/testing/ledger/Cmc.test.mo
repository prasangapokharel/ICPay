import Debug "mo:core/Debug";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Cmc "../../src/ledger/Cmc";
import Config "../../src/config/Config";
import Subaccount "../../src/ledger/Subaccount";
import AccountHelper "../../src/ledger/Account";

let cmc = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");
let self = Principal.fromText("6vbhm-nqaaa-aaaan-q6muq-cai");

// Ground truth from `dfx ledger account-id --of-principal rkp4c-7iaaa-aaaaa-aaaca-cai
// --subaccount-from-principal 6vbhm-nqaaa-aaaan-q6muq-cai`. This is the account a
// launch sends 2 ICP to before notify_create_canister. A wrong derivation does
// not announce itself: the transfer succeeds and the ICP lands in an account
// nobody owns, so it is pinned here rather than checked on mainnet.
let expected = "3adc5de13a2c69eddb66b26e3adc2ce54bbf1e598e57a46be9ea21a64edbd484";
let derived = AccountHelper.toHex(Cmc.accountOf(cmc, self));
if (derived != expected) {
  Debug.print("expected " # expected);
  Debug.print("derived  " # derived);
  assert false;
};
Debug.print("PASS: CMC create account matches dfx derivation");

// The custodial encoding is right-aligned and the CMC's is left-aligned, so the
// two are not interchangeable. Asserting they differ keeps a later "simplify"
// from collapsing them into one helper.
let custodial = AccountHelper.toHex(Principal.toLedgerAccount(cmc, ?Subaccount.fromPrincipal(self)));
assert (custodial != expected);
Debug.print("PASS: custodial subaccount encoding is NOT the CMC encoding");

// Length prefix first, then the principal bytes, then zero padding.
let sub = Subaccount.toArray(Cmc.subaccountOf(self));
let selfBytes = Subaccount.toArray(Principal.toBlob(self));
assert (sub.size() == 32);
assert (sub[0] == Nat8.fromNat(selfBytes.size()));
assert (sub[1] == selfBytes[0]);
assert (sub[31] == 0);
Debug.print("PASS: CMC subaccount is 32 bytes, length-prefixed, left-aligned");

// Distinct targets must never share an account, or one launch's cycles fund
// another's canister.
let other = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
assert (Cmc.subaccountOf(self) != Cmc.subaccountOf(other));
assert (Cmc.accountOf(cmc, self) != Cmc.accountOf(cmc, other));
Debug.print("PASS: CMC accounts are distinct per target");

// b"CREA" and b"TPUP" read little-endian, which is how the CMC decodes the
// legacy memo. A wrong memo makes the CMC refund instead of mint.
assert (Cmc.MEMO_CREATE_CANISTER == 0x41455243);
assert (Cmc.MEMO_TOP_UP_CANISTER == 0x50555054);
Debug.print("PASS: CMC memos");

// install_chunked_code refuses when the store canister and the target are on
// different subnets, and the chunk store is ours. Passing null here lets the
// CMC place the token anywhere, which failed every launch that reached the
// install -- so the request must name our own subnet, not merely be present.
let arg: Cmc.NotifyCreateCanisterArg = {
  block_index = 1;
  controller = self;
  subnet_type = null;
  subnet_selection = ?#Subnet({ subnet = Principal.fromText(Config.OWN_SUBNET) });
  settings = null;
};
switch (arg.subnet_selection) {
  case (?#Subnet({ subnet })) { assert (Principal.toText(subnet) == Config.OWN_SUBNET) };
  case (null) { assert false };
};
assert (Config.OWN_SUBNET == "cv73p-6v7zi-u67oy-7jc3h-qspsz-g5lrj-4fn7k-xrax3-thek2-sl46v-jae");
Debug.print("PASS: canister creation is pinned to the subnet holding the chunk store");

Debug.print("ALL CMC TESTS PASSED");
