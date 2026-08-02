import Principal "mo:core/Principal";
import List "mo:core/List";
import Types "../types";
import Config "../config/Config";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";

module {
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, byUser: TxStorage.TxByUser): TransactionService {
    { users; txs; byUser };
  };

  public type TransactionService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
  };

  public func list(service: TransactionService, caller: Principal, page: Nat, pageSize: Nat): Types.ApiResult<{ items: [Types.TransactionPublic]; total: Nat; page: Nat; pageSize: Nat }> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let requested = if (pageSize == 0) { Config.PAGE_SIZE } else { pageSize };
        let limit = if (requested > Config.MAX_PAGE_SIZE) { Config.MAX_PAGE_SIZE } else { requested };
        let offset = page * limit;
        let txs = TxRepo.getByUser(service.byUser, user.id, limit, offset);
        let total = TxRepo.getUserTxCount(service.byUser, user.id);
        let items = List.map<Types.Transaction, Types.TransactionPublic>(
          List.fromArray(txs),
          func(tx) { Types.txToPublic(tx) }
        );
        #ok({ items = List.toArray(items); total; page; pageSize = limit });
      };
      case (null) { #err("User not found") };
    };
  };

  public func getDetail(service: TransactionService, caller: Principal, txId: Types.TxId): Types.ApiResult<Types.TransactionPublic> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        switch (TxRepo.getById(service.txs, txId)) {
          case (?tx) {
            if (tx.userId != user.id) {
              return #err("Transaction not found");
            };
            #ok(Types.txToPublic(tx));
          };
          case (null) { #err("Transaction not found") };
        };
      };
      case (null) { #err("User not found") };
    };
  };
};
