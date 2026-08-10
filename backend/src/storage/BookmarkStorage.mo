import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types";

module {
  public type BookmarkMap = Map.Map<Types.UserId, List.List<Types.Bookmark>>;

  public func createBookmarkMap(): BookmarkMap {
    Map.empty<Types.UserId, List.List<Types.Bookmark>>()
  };
};
