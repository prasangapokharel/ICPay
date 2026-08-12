import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
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
  ): Types.ApiResult<[Types.BookmarkPublic]> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let items = BookmarkRepo.listByUser(service.bookmarks, user.id);
        #ok(Array.map<Types.Bookmark, Types.BookmarkPublic>(items, func(b) { toPublic(service, b) }))
      };
      case (null) { #err("User not found") };
    };
  };

  public func add(
    service: BookmarkService,
    caller: Principal,
    targetUserId: Types.UserId,
  ): Types.ApiResult<Types.BookmarkPublic> {
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
            #ok(toPublic(service, entry));
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

  private func toPublic(service: BookmarkService, bookmark: Types.Bookmark) : Types.BookmarkPublic {
    let username = switch (UserRepo.getById(service.usersById, service.users, bookmark.targetUserId)) {
      case (?user) user.username;
      case (null) null;
    };
    {
      targetUserId = bookmark.targetUserId;
      username = username;
      createdAt = bookmark.createdAt;
    }
  };
};
