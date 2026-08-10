import Types "../../types";
import BookmarkService "../../services/BookmarkService";
import MiddlewareAuth "../../middleware/Auth";

mixin (bookmarks: BookmarkService.BookmarkService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func listBookmarks() : async Types.ApiResult<[Types.Bookmark]> {
    BookmarkService.list(bookmarks, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func addBookmark(targetUserId: Types.UserId) : async Types.ApiResult<Types.Bookmark> {
    BookmarkService.add(bookmarks, MiddlewareAuth.effectiveCaller(mwConfig, caller), targetUserId);
  };

  public shared ({ caller }) func removeBookmark(targetUserId: Types.UserId) : async Types.ApiResult<()> {
    BookmarkService.remove(bookmarks, MiddlewareAuth.effectiveCaller(mwConfig, caller), targetUserId);
  };
};
