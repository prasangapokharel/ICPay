import List "mo:core/List";
import Map "mo:core/Map";
import Types "../types";
import Config "../config/Config";

// Phase 3 added a required `ledgerId` field to the Transaction record.
//
// APPLIED. This ran on the deploy that shipped Phase 3, and the live canister's
// stable signature already carries `ledgerId`. It must NOT be re-wired into
// main.mo: with the field already persisted, moc compares the live (new) shape
// against this module's OldTransaction input and rejects the upgrade with the
// very M0170 the migration was written to resolve. Kept for the record, and
// because its test documents the transformation.
//
// Adding a record field to the type of a persisted stable variable is an
// incompatible upgrade (Motoko error M0170): a persistent actor cannot conjure
// a value for the new field out of thin air, so dfx refuses the upgrade unless
// the canister declares an explicit migration function. That function runs only
// on upgrade and is ignored on a fresh install.
//
// Before Phase 3 the canister settled on exactly one ledger -- the ICP one
// (Config.ICP_LEDGER_CANISTER_ID) -- so every legacy row is rebuilt against
// that id. The migration runs exactly once (on the upgrade that introduces the
// field), so the stamp is unconditional; a row that survives to a later upgrade
// already has its ledgerId and is carried by orthogonal persistence.
//
// `ledgerId` is immutable on the record, so a row cannot be updated in place:
// each legacy row is reconstructed as a new object. `List.map` builds a fresh
// list of new objects, carrying every var field across. The new list replaces
// `transactions` wholesale.
//
// `transactionsByUser` is a stable variable in its own right, holding the same
// row type, so it has to be named here too -- listing only `transactions` still
// leaves the old shape reachable through the index and moc rejects the upgrade.
// It is returned *empty* rather than mapped, because it is a derived index of
// *references* into `transactions`: status is mutated in place through those
// shared objects. Mapping it separately would mint a second set of rows, and a
// later tx.complete() would update one copy while the other kept reporting
// #pending. TransactionRepository.reindex() rebuilds it from the stamped log in
// the actor body, which restores the sharing.
module {
  // The Transaction record exactly as it was serialised before Phase 3. It is
  // declared here rather than imported so the migration's input type can never
  // accidentally track the current record (which already has ledgerId); the
  // difference is precisely the field this migration adds.
  public type OldTransaction = {
    id: Text;
    userId: Text;
    txType: { #deposit; #withdraw; #transfer; #fee };
    amount: Nat;
    fee: Nat;
    from: Text;
    to: Text;
    var status: { #pending; #completed; #failed; #cancelled };
    var blockIndex: ?Nat64;
    memo: ?Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type OldTxList = List.List<OldTransaction>;
  public type OldTxByUser = Map.Map<Text, OldTxList>;

  public func migration(
    old: { transactions: OldTxList; transactionsByUser: OldTxByUser }
  ): {
    transactions: List.List<Types.Transaction>;
    transactionsByUser: Map.Map<Types.UserId, List.List<Types.Transaction>>;
  } {
    {
      transactions = List.map<OldTransaction, Types.Transaction>(
        old.transactions,
        func(tx) {
          // Before Phase 3 there was no ledgerId on the record, so every legacy
          // row clears on the ICP ledger -- the only one the canister could
          // settle then. The stamp is unconditional because the input type has
          // no ledger field to be blank or already set; the record is rebuilt
          // once and the upgrade happens exactly once.
          {
            id = tx.id;
            userId = tx.userId;
            txType = tx.txType;
            ledgerId = Config.ICP_LEDGER_CANISTER_ID;
            amount = tx.amount;
            fee = tx.fee;
            from = tx.from;
            to = tx.to;
            var status = tx.status;
            var blockIndex = tx.blockIndex;
            memo = tx.memo;
            createdAt = tx.createdAt;
            var updatedAt = tx.updatedAt;
          };
        },
      );
      transactionsByUser = Map.empty<Types.UserId, List.List<Types.Transaction>>();
    };
  };
};
