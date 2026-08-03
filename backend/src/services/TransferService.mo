import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Types "../types";
import UUID "../utils/UUID";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import Subaccount "../ledger/Subaccount";
import Helpers "../utils/Helpers";
import LedgerService "LedgerService";
import LedgerTypes "../ledger/Types";
import TransferError "../ledger/TransferError";
import TxModel "../models/Transaction";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import AmountValidator "../validators/AmountValidator";
import TransferValidator "../validators/TransferValidator";

module {
  public func create(
    users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    txs: TxStorage.TxList,
    byUser: TxStorage.TxByUser,
    ledger: LedgerService.LedgerService,
  ) : TransferService {
    { users; usernames; txs; byUser; ledger };
  };

  public type TransferService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
  };

  public func transferByUsername(service: TransferService, caller: Principal, username: Types.Username, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByUsername(service.usernames, service.users, username)) {
      case (?recipient) {
        switch (TransferValidator.validateSelfTransfer(caller, recipient)) {
          case (?err) { return #err(err) };
          case (null) {};
        };
        let destination = LedgerService.depositAccount(service.ledger, recipient.principal);
        await doTransfer(service, caller, destination, amount, "@" # username, memo);
      };
      case (null) { #err("Username not found: @" # username) };
    };
  };

  public func transferByPrincipal(service: TransferService, caller: Principal, to: Principal, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    if (Principal.isAnonymous(to)) {
      return #err("Cannot transfer to anonymous principal");
    };
    // Registered users are credited in their custodial account; anyone else is
    // paid out to their own default ledger account.
    let destination = switch (UserRepo.getByPrincipal(service.users, to)) {
      case (?_) { LedgerService.depositAccount(service.ledger, to) };
      case (null) { AccountHelper.defaultAccount(to) };
    };
    await doTransfer(service, caller, destination, amount, Principal.toText(to), memo);
  };

  public func transferByAccount(service: TransferService, caller: Principal, to: LedgerTypes.Account, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    await doTransfer(service, caller, to, amount, AccountHelper.toText(to), memo);
  };

  // Resolves the sender and their custodial account. Deliberately does NOT read
  // the balance: the ledger checks funds itself and returns the balance in its
  // #InsufficientFunds error, so a pre-flight read costs a whole extra consensus
  // round (~3.5s measured) to compute an answer the transfer already gives back.
  // It was also racy -- the balance can change between the read and the transfer,
  // so passing the check never guaranteed the transfer would succeed.
  func resolveSender(service: TransferService, caller: Principal): Types.ApiResult<{ userId: Types.UserId; source: LedgerTypes.Account }> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?sender) {
        #ok({ userId = sender.id; source = LedgerService.depositAccount(service.ledger, caller) });
      };
      case (null) { #err("User not found") };
    };
  };

  public func transferByAccountId(service: TransferService, caller: Principal, accountIdHex: Text, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    if (accountIdHex.size() != 64) {
      return #err("Account identifier must be 64 hex characters");
    };
    switch (TransferValidator.validateMemo(memo)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let toBlob = Helpers.hexToBlob(accountIdHex);
    switch (resolveSender(service, caller)) {
      case (#err(e)) { #err(e) };
      case (#ok({ userId; source })) {
        let fee = Config.ICP_FEE;
        let now = Time.now();
        let id = UUID.generate();
        let fromLabel = AccountHelper.toAccountIdentifier(source);
        let tx = TxRepo.create(
          service.txs, service.byUser, id, userId, #transfer, amount, fee,
          fromLabel, accountIdHex, memo, now,
        );
        let now64 = Nat64.fromNat(Int.abs(now));
        let oldArgs: LedgerTypes.OldTransferArgs = {
          to = toBlob;
          amount = { e8s = Nat64.fromNat(amount) };
          fee = { e8s = Nat64.fromNat(fee) };
          memo = 0;
          from_subaccount = source.subaccount;
          created_at_time = ?{ timestamp_nanos = now64 };
        };
        let result = await LedgerService.transferToAccountIdentifier(service.ledger, oldArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            tx.complete(blockIdx, now);
            // An account identifier can still name a local user's custodial
            // account, so the recipient side is recorded here too.
            switch (userByAccountIdentifier(service, accountIdHex)) {
              case (null) {};
              case (?recipient) {
                if (recipient.principal != caller) {
                  let rx = TxRepo.create(
                    service.txs, service.byUser, UUID.generate(), recipient.id, #deposit, amount, 0,
                    fromLabel, accountIdHex, memo, now,
                  );
                  rx.complete(blockIdx, now);
                };
              };
            };
            #ok({ blockIndex = blockIdx; txId = id });
          };
          case (#Err(e)) {
            tx.fail(now);
            #err("Transfer failed: " # TransferError.describeOld(e));
          };
        };
      };
    };
  };

  func doTransfer(service: TransferService, caller: Principal, destination: LedgerTypes.Account, amount: Nat, toLabel: Text, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (TransferValidator.validateMemo(memo)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (resolveSender(service, caller)) {
      case (#err(e)) { #err(e) };
      case (#ok({ userId; source })) {
        let fee = Config.ICP_FEE;
        let now = Time.now();
        let id = UUID.generate();
        let fromLabel = AccountHelper.toAccountIdentifier(source);
        let tx = TxRepo.create(
          service.txs, service.byUser, id, userId, #transfer, amount, fee,
          fromLabel, toLabel, memo, now,
        );
        let memoBlob = switch (memo) {
          case (?m) { ?Text.encodeUtf8(m) };
          case (null) { null };
        };
        let now64 = Nat64.fromNat(Int.abs(now));
        let transferArgs: LedgerTypes.TransferArgs = {
          from_subaccount = source.subaccount;
          to = destination;
          amount;
          fee = ?fee;
          memo = memoBlob;
          created_at_time = ?now64;
        };
        let result = await LedgerService.transfer(service.ledger, transferArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            tx.complete(blockIdx64, now);
            creditRecipient(service, caller, destination, amount, fromLabel, memo, blockIdx64, now);
            #ok({ blockIndex = blockIdx64; txId = id });
          };
          case (#Err(e)) {
            tx.fail(now);
            #err("Transfer failed: " # TransferError.describe(e));
          };
        };
      };
    };
  };

  // A transfer writes one row for the sender; without a matching row the
  // recipient sees their balance move with no history to explain it. The row is
  // #deposit so syncDeposits counts it as already credited -- otherwise the
  // arrived funds would look unaccounted for and be credited a second time.
  func creditRecipient(
    service: TransferService,
    sender: Principal,
    destination: LedgerTypes.Account,
    amount: Nat,
    fromLabel: Text,
    memo: ?Text,
    blockIndex: Nat64,
    now: Int,
  ) {
    switch (recipientOf(service, destination)) {
      case (null) {};
      case (?recipient) {
        if (recipient.principal == sender) { return };
        let rx = TxRepo.create(
          service.txs, service.byUser, UUID.generate(), recipient.id, #deposit, amount, 0,
          fromLabel, AccountHelper.toAccountIdentifier(destination), memo, now,
        );
        rx.complete(blockIndex, now);
      };
    };
  };

  // Only custodial accounts belong to a user of this wallet: the canister owns
  // them and the subaccount encodes whose they are. A transfer out to someone's
  // own ledger account has no local owner and records nothing.
  func recipientOf(service: TransferService, destination: LedgerTypes.Account): ?Types.User {
    if (destination.owner != service.ledger.custodian) { return null };
    switch (destination.subaccount) {
      case (null) { null };
      case (?sub) {
        for ((p, user) in service.users.entries()) {
          if (Subaccount.fromPrincipal(p) == sub) { return ?user };
        };
        null;
      };
    };
  };

  func userByAccountIdentifier(service: TransferService, accountIdHex: Text): ?Types.User {
    for ((p, user) in service.users.entries()) {
      let account = LedgerService.depositAccount(service.ledger, p);
      if (AccountHelper.toAccountIdentifier(account) == accountIdHex) { return ?user };
    };
    null;
  };
};
