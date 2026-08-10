import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import BookmarkRepo "../repositories/BookmarkRepository";
import UserStorage "../storage/UserStorage";
import BookmarkStorage "../storage/BookmarkStorage";

module {
  public type BookmarkService = {
    users: UserStorage.UserMap;
    usersById: UserStorage.UserIdMap;
    bookmarks: BookmarkStorage.BookmarkMap;
  };

  public func create(
    users: UserStorage.UserMap,
    usersById: UserStorage.UserIdMap,
    bookmarks: BookmarkStorage.BookmarkMap,
  ): BookmarkService {
    { users; usersById; bookmarks };
  };

  public func list(
    service: BookmarkService,
    caller: Principal,
  ): Types.ApiResult<[Types.Bookmark]> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) { #ok(BookmarkRepo.listByUser(service.bookmarks, user.id)) };
      case (null) { #err("User not found") };
    };
  };

  public func add(
    service: BookmarkService,
    caller: Principal,
    targetUserId: Types.UserId,
  ): Types.ApiResult<Types.Bookmark> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?owner) {
        if (owner.id == targetUserId) {
          return #err("Cannot bookmark yourself");
        };
        switch (UserRepo.getById(service.usersById, service.users, targetUserId)) {
          case (null) { #err("Target user not found") };
          case (?_) {
            let entry = BookmarkRepo.add(service.bookmarks, owner.id, targetUserId, Time.now());
            #ok(entry);
          };
        };
      };
    };
  };

  public func remove(
    service: BookmarkService,
    caller: Principal,
    targetUserId: Types.UserId,
  ): Types.ApiResult<()> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?owner) {
        if (BookmarkRepo.remove(service.bookmarks, owner.id, targetUserId)) {
          #ok(())
        } else {
          #err("Bookmark not found")
        };
      };
    };
  };
};
