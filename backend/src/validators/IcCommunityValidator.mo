import Char "mo:core/Char";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Config "../config/Config";
import FileValidator "../utils/FileValidator";
import IcCommunityStorage "../storage/IcCommunityStorage";

module {
  public func normalizeSlug(slug: Text): Text {
    Text.toLower(slug);
  };

  public func validateSlug(slug: Text): ?Text {
    let s = normalizeSlug(slug);
    if (s.size() < IcCommunityStorage.MIN_SLUG) {
      return ?("Channel username must be at least " # Nat.toText(IcCommunityStorage.MIN_SLUG) # " characters");
    };
    if (s.size() > IcCommunityStorage.MAX_SLUG) {
      return ?("Channel username must be at most " # Nat.toText(IcCommunityStorage.MAX_SLUG) # " characters");
    };
    for (c in s.chars()) {
      if (not isSlugChar(c)) {
        return ?("Channel username may only contain lowercase letters, digits, and underscores");
      };
    };
    null;
  };

  public func validateName(name: Text): ?Text {
    let trimmed = Text.trim(name, #char ' ');
    if (trimmed.size() == 0) { return ?"Channel name is required" };
    if (trimmed.size() > IcCommunityStorage.MAX_NAME) { return ?"Channel name is too long" };
    null;
  };

  public func validateBio(bio: Text): ?Text {
    if (bio.size() > IcCommunityStorage.MAX_BIO) { return ?"Bio is too long" };
    null;
  };

  public func validateReactionCode(code: Nat8): ?Text {
    let n = Nat8.toNat(code);
    if (n < 1 or n > Nat8.toNat(IcCommunityStorage.MAX_REACTION_CODE)) {
      return ?"Invalid reaction";
    };
    null;
  };

  public func validateMessage(text: Text): ?Text {
    let trimmed = Text.trim(text, #char ' ');
    if (trimmed.size() == 0) { return ?"Message is required" };
    if (trimmed.size() > IcCommunityStorage.MAX_MESSAGE) { return ?"Message is too long" };
    null;
  };

  public func validateChannelAvatar(avatar: ?Blob): ?Text {
    switch (avatar) {
      case (null) null;
      case (?data) {
        if (data.size() == 0) { return ?"Channel photo is empty" };
        if (data.size() > IcCommunityStorage.MAX_CHANNEL_AVATAR_BYTES) {
          return ?"Channel photo must be at most 10 KB";
        };
        if (not FileValidator.validateWebpHeader(data)) {
          return ?"Channel photo must be WebP";
        };
        null;
      };
    };
  };

  public func validatePrice(access: { #free; #paid }, priceE8s: Nat): ?Text {
    switch (access) {
      case (#free) {
        if (priceE8s != 0) { ?"Free channels cannot have a price" } else { null };
      };
      case (#paid) {
        if (priceE8s < Config.COMMUNITY_MIN_PRICE_E8S) {
          ?("Paid channel price must be at least 0.1 ICP");
        } else if (priceE8s > Config.COMMUNITY_MAX_PRICE_E8S) {
          ?("Paid channel price must be at most 10 ICP");
        } else {
          null;
        };
      };
    };
  };

  func isSlugChar(c: Char): Bool {
    (c >= 'a' and c <= 'z')
    or (c >= '0' and c <= '9')
    or c == '_';
  };
};
