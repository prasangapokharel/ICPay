import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Types "../types";
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
import AccountValidator "../validators/AccountValidator";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(
    users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    txs: TxStorage.TxList,
    byUser: TxStorage.TxByUser,
    ledger: LedgerService.LedgerService,
    nextId: () -> Text,
    limits: RateLimitStorage.RateLimitMap,
  ) : TransferService {
    { users; usernames; txs; byUser; ledger; nextId; limits };
  };

  public type TransferService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
    nextId: () -> Text;
    // One budget across all four transfer* entrypoints -- they are the same
    // spend from the same account, just addressed differently.
    limits: RateLimitStorage.RateLimitMap;
  };

  public func transferByUsername(service: TransferService, caller: Principal, ledgerId: Text, username: Types.Username, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    switch (validateRequest(service, ledgerId, amount)) {
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
        await doTransfer(service, caller, ledgerId, destination, amount, "@" # username, memo);
      };
      case (null) { #err("Username not found: @" # username) };
    };
  };

  public func transferByPrincipal(service: TransferService, caller: Principal, ledgerId: Text, to: Principal, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    switch (validateRequest(service, ledgerId, amount)) {
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
    await doTransfer(service, caller, ledgerId, destination, amount, Principal.toText(to), memo);
  };

  public func transferByAccount(service: TransferService, caller: Principal, ledgerId: Text, to: LedgerTypes.Account, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    await transferByAccountInternal(service, caller, ledgerId, to, amount, memo);
  };

  // The paid flows settle through here. They hold their own window already, so
  // going through the gated entrypoint would charge one purchase against two
  // budgets and let a few buys lock the caller out of ordinary transfers.
  public func transferByAccountInternal(service: TransferService, caller: Principal, ledgerId: Text, to: LedgerTypes.Account, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (validateRequest(service, ledgerId, amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    await doTransfer(service, caller, ledgerId, to, amount, AccountHelper.toText(to), memo);
  };

  // The ledger allowlist is a security boundary, not a convenience check: an
  // unvalidated id reaching actor(id) lets a caller point the custodian at a
  // canister they wrote, which can return a forged #Ok and write a bogus
  // "received" row into someone else's history.
  func validateRequest(service: TransferService, ledgerId: Text, amount: Nat): ?Text {
    if (not LedgerService.isAllowed(service.ledger, ledgerId)) {
      return ?("Unsupported token ledger: " # ledgerId);
    };
    AmountValidator.validate(amount);
  };

  // Resolves the sender and their custodial account. Deliberately does NOT read
  // the balance: the ledger checks funds itself and returns the balance in its
  // #InsufficientFunds error, so a pre-flight read costs a whole extra consensus
  // round (~3.5s measured) to compute an answer the transfer already gives back.
  // It was also racy -- the balance can change between the read and the transfer,
  // so passing the check never guaranteed the transfer would succeed.
  func resolveSender(service: TransferService, caller: Principal): Types.ApiResult<{ userId: Types.UserId; source: LedgerTypes.Account; senderName: Text }> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?sender) {
        let source = LedgerService.depositAccount(service.ledger, caller);
        // What the recipient sees in their "from" column. Their row used to carry
        // the sender's account identifier, which is correct but unreadable -- a
        // handle is the same account said in a way they can act on. Senders with
        // no username still fall back to the identifier.
        let senderName = switch (sender.username) {
          case (?name) { "@" # name };
          case (null) { AccountHelper.toAccountIdentifier(source) };
        };
        #ok({ userId = sender.id; source; senderName });
      };
      case (null) { #err("User not found") };
    };
  };

  // ICP-only by nature: account identifiers are an ICP-ledger concept and no
  // other ICRC-1 ledger implements the legacy transfer method. Its fee field is
  // required rather than optional, so this is the one path that must send a
  // real number.
  public func transferByAccountId(service: TransferService, caller: Principal, accountIdHex: Text, amount: Nat, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (AccountValidator.validateAccountId(accountIdHex)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (TransferValidator.validateMemo(memo)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let toBlob = Helpers.hexToBlob(accountIdHex);
    switch (resolveSender(service, caller)) {
      case (#err(e)) { #err(e) };
      case (#ok({ userId; source; senderName })) {
        let ledgerId = Config.ICP_LEDGER_CANISTER_ID;
        let fee = await LedgerService.getFee(ledgerId);
        let now = Time.now();
        let id = service.nextId();
        let fromLabel = AccountHelper.toAccountIdentifier(source);
        let tx = TxRepo.create(
          service.txs, service.byUser, id, userId, #transfer, ledgerId, amount, fee,
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
        let result = await LedgerService.transferToAccountIdentifier(oldArgs);
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
                    service.txs, service.byUser, service.nextId(), recipient.id, #deposit, ledgerId, amount, 0,
                    senderName, accountIdHex, memo, now,
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

  func doTransfer(service: TransferService, caller: Principal, ledgerId: Text, destination: LedgerTypes.Account, amount: Nat, toLabel: Text, memo: ?Text): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (TransferValidator.validateMemo(memo)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (resolveSender(service, caller)) {
      case (#err(e)) { #err(e) };
      case (#ok({ userId; source; senderName })) {
        // Recorded for display only. The ledger is not told this number -- see
        // the null fee below -- so a stale read misreports a row rather than
        // failing a transfer.
        let fee = await LedgerService.getFee(ledgerId);
        let now = Time.now();
        let id = service.nextId();
        let fromLabel = AccountHelper.toAccountIdentifier(source);
        let tx = TxRepo.create(
          service.txs, service.byUser, id, userId, #transfer, ledgerId, amount, fee,
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
          // Null means "charge whatever you charge". Sending a number instead
          // makes every ledger whose fee differs from our guess fail with
          // #BadFee -- and a fetched fee is still a guess, since it can change
          // between the read and this call. It also keeps burns working, which
          // require an absent or zero fee.
          fee = null;
          memo = memoBlob;
          created_at_time = ?now64;
        };
        let result = await LedgerService.transfer(ledgerId, transferArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            tx.complete(blockIdx64, now);
            creditRecipient(service, caller, ledgerId, destination, amount, senderName, memo, blockIdx64, now);
            #ok({ blockIndex = blockIdx64; txId = id });
          };
          // A retried request can come back #Duplicate: the ledger already settled
          // this transfer on the earlier attempt. Still a success -- the funds
          // moved at the returned block -- and the recipient must still be
          // credited, or the arrived funds would later read as an unattributed
          // deposit and be credited twice.
          case (#Err(#Duplicate({ duplicate_of }))) {
            let blockIdx64 = Nat64.fromNat(duplicate_of);
            tx.complete(blockIdx64, now);
            creditRecipient(service, caller, ledgerId, destination, amount, senderName, memo, blockIdx64, now);
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
    ledgerId: Text,
    destination: LedgerTypes.Account,
    amount: Nat,
    senderLabel: Text,
    memo: ?Text,
    blockIndex: Nat64,
    now: Int,
  ) {
    switch (recipientOf(service, destination)) {
      case (null) {};
      case (?recipient) {
        if (recipient.principal == sender) { return };
        let rx = TxRepo.create(
          service.txs, service.byUser, service.nextId(), recipient.id, #deposit, ledgerId, amount, 0,
          senderLabel, AccountHelper.toAccountIdentifier(destination), memo, now,
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
