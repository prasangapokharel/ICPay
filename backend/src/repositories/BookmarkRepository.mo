import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Types "../types";
import BookmarkStorage "../storage/BookmarkStorage";

module {
  public func listByUser(
    bookmarks: BookmarkStorage.BookmarkMap,
    userId: Types.UserId,
  ): [Types.Bookmark] {
    switch (Map.get(bookmarks, Text.compare, userId)) {
      case (?l) { List.toArray(l) };
      case (null) { [] };
    };
  };

  public func exists(
    bookmarks: BookmarkStorage.BookmarkMap,
    ownerUserId: Types.UserId,
    targetUserId: Types.UserId,
  ): Bool {
    switch (Map.get(bookmarks, Text.compare, ownerUserId)) {
      case (?l) { List.any(l, func(b: Types.Bookmark): Bool { b.targetUserId == targetUserId }) };
      case (null) { false };
    };
  };

  // Adds a bookmark; silently replaces if the target is already bookmarked.
  public func add(
    bookmarks: BookmarkStorage.BookmarkMap,
    ownerUserId: Types.UserId,
    targetUserId: Types.UserId,
    createdAt: Int,
  ): Types.Bookmark {
    let entry: Types.Bookmark = { ownerUserId; targetUserId; createdAt };
    let existing = switch (Map.get(bookmarks, Text.compare, ownerUserId)) {
      case (?l) { List.filter(l, func(b: Types.Bookmark): Bool { b.targetUserId != targetUserId }) };
      case (null) { List.empty<Types.Bookmark>() };
    };
    List.add(existing, entry);
    Map.add(bookmarks, Text.compare, ownerUserId, existing);
    entry;
  };

  // Returns true if something was removed, false if it was not present.
  public func remove(
    bookmarks: BookmarkStorage.BookmarkMap,
    ownerUserId: Types.UserId,
    targetUserId: Types.UserId,
  ): Bool {
    switch (Map.get(bookmarks, Text.compare, ownerUserId)) {
      case (?l) {
        let before = List.size(l);
        let after = List.filter(l, func(b: Types.Bookmark): Bool { b.targetUserId != targetUserId });
        if (List.size(after) < before) {
          Map.add(bookmarks, Text.compare, ownerUserId, after);
          true
        } else { false };
      };
      case (null) { false };
    };
  };
};
