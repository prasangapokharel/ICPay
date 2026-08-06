import Nat8 "mo:core/Nat8";
import Nat64 "mo:core/Nat64";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

module {
  // The NNS Cycles Minting Canister. Only the two notify endpoints are declared;
  // the rest of its interface is NNS machinery this canister has no business
  // calling. settings is an opt field we always pass null for, so its payload
  // shape is left as unit rather than mirrored.

  // Only the Subnet arm is declared -- the CMC's type also carries a Filter
  // arm, but a variant with fewer cases is a Candid subtype and picking a
  // specific subnet is the only reason we set this field at all.
  public type SubnetSelection = { #Subnet: { subnet: Principal } };

  public type NotifyCreateCanisterArg = {
    block_index: Nat64;
    controller: Principal;
    subnet_type: ?Text;
    subnet_selection: ?SubnetSelection;
    settings: ?();
  };

  public type NotifyTopUpArg = { block_index: Nat64; canister_id: Principal };

  public type NotifyError = {
    #Refunded: { reason: Text; block_index: ?Nat64 };
    #InvalidTransaction: Text;
    #Other: { error_code: Nat64; error_message: Text };
    #Processing;
    #TransactionTooOld: Nat64;
  };

  public type CmcService = actor {
    notify_create_canister: shared NotifyCreateCanisterArg
      -> async { #Ok: Principal; #Err: NotifyError };
    notify_top_up: shared NotifyTopUpArg
      -> async { #Ok: Nat; #Err: NotifyError };
  };

  // ASCII read little-endian, which is how the CMC decodes the legacy memo
  // field: b"CREA" = 43 52 45 41, reversed = 0x41455243. A wrong memo makes the
  // CMC refund the transfer rather than mint, so a mistake here fails loudly.
  public let MEMO_CREATE_CANISTER: Nat64 = 0x41455243; // "CREA"
  public let MEMO_TOP_UP_CANISTER: Nat64 = 0x50555054; // "TPUP"

  // Length-prefixed and LEFT-aligned, which is the NNS convention and the
  // opposite of ledger/Subaccount.fromPrincipal. Do not substitute one for the
  // other: the CMC looks for the funds under exactly this encoding, and a
  // transfer to the right-aligned variant lands in an account nobody owns.
  public func subaccountOf(p: Principal): Blob {
    let bytes = Blob.toArray(Principal.toBlob(p));
    let len = bytes.size();
    assert (len <= 31);
    Blob.fromArray(Array.tabulate<Nat8>(32, func i {
      if (i == 0) { Nat8.fromNat(len) } else if (i <= len) { bytes[i - 1] } else { 0 };
    }));
  };

  // Where the ICP has to be sent before notifying. `target` is whoever the
  // minted cycles are for: this canister for a create, the token for a top-up.
  public func accountOf(cmc: Principal, target: Principal): Blob {
    Principal.toLedgerAccount(cmc, ?subaccountOf(target));
  };
};
