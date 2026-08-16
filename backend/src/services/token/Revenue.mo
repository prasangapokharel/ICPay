import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Option "mo:core/Option";
import Types "../../types";
import Config "../../config/Config";
import Cmc "../../ledger/Cmc";
import Management "../../ledger/Management";
import LedgerTypes "../../ledger/Types";
import AccountHelper "../../ledger/Account";
import TransferError "../../ledger/TransferError";
import TokenRepo "../../repositories/TokenRepository";
import LedgerService "../LedgerService";
import Context "Context";
import Notify "Notify";

module {
  public func sweepRevenue(service: Context.TokenService): async Types.ApiResult<Nat64> {
    let from = AccountHelper.fixedAccount(service.self, Config.REVENUE_SUBACCOUNT);
    let balance = await LedgerService.getBalance(Config.ICP_LEDGER_CANISTER_ID, from);
    let fee = await LedgerService.getFee(Config.ICP_LEDGER_CANISTER_ID);
    if (balance <= fee) { return #err("Nothing to sweep") };

    switch (await LedgerService.transfer(Config.ICP_LEDGER_CANISTER_ID, {
      from_subaccount = ?Config.REVENUE_SUBACCOUNT;
      to = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
      amount = balance - fee : Nat;
      fee = ?fee;
      memo = null;
      created_at_time = null;
    })) {
      case (#Ok(blockIndex)) { #ok(Nat64.fromNat(blockIndex)) };
      case (#Err(e)) { #err(TransferError.describe(e)) };
    };
  };

  public func releaseFailedCanister(
    service: Context.TokenService,
    canisterId: Text,
    to: Principal,
  ): async Types.ApiResult<()> {
    switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (null) { return #err("No launch recorded for " # canisterId) };
      case (?t) {
        switch (t.status) {
          case (#failed(_)) {};
          case (_) { return #err("Token " # canisterId # " is not a failed launch") };
        };
      };
    };
    let mgmt: Management.ManagementService = actor (Config.MANAGEMENT_CANISTER_ID);
    await mgmt.update_settings({
      canister_id = Principal.fromText(canisterId);
      settings = {
        controllers = ?[to];
        compute_allocation = null;
        memory_allocation = null;
        freezing_threshold = null;
      };
    });
    #ok(());
  };

  public func topUpToken(service: Context.TokenService, canisterId: Text, amount: Nat): async Types.ApiResult<Nat> {
    let target = switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (?t) { t };
      case (null) { return #err("Unknown token: " # canisterId) };
    };
    let targetPrincipal = Principal.fromText(canisterId);
    let args: LedgerTypes.OldTransferArgs = {
      to = Cmc.accountOf(Principal.fromText(Config.CMC_CANISTER_ID), targetPrincipal);
      amount = { e8s = Nat64.fromNat(amount) };
      fee = { e8s = 10_000 };
      memo = Cmc.MEMO_TOP_UP_CANISTER;
      from_subaccount = ?Config.REVENUE_SUBACCOUNT;
      created_at_time = null;
    };
    let block = switch (await LedgerService.transferToAccountIdentifier(args)) {
      case (#Ok(b)) { b };
      case (#Err(e)) { return #err(TransferError.describeOld(e)) };
    };
    let cmc: Cmc.CmcService = actor (Config.CMC_CANISTER_ID);
    switch (await cmc.notify_top_up({ block_index = block; canister_id = targetPrincipal })) {
      case (#Ok(cycles)) {
        target.cyclesFunded := ?(Option.get(target.cyclesFunded, 0) + cycles);
        #ok(cycles);
      };
      case (#Err(e)) { #err(Notify.describeNotifyError(e)) };
    };
  };
};
