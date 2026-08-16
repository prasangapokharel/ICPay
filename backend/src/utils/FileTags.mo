import Array "mo:core/Array";
import Text "mo:core/Text";

module {
  public func dedupe(tags: [Text]) : [Text] {
    var out : [Text] = [];
    for (tag in tags.vals()) {
      let trimmed = Text.trim(tag, #text " ");
      if (trimmed.size() > 0 and not contains(out, trimmed)) {
        out := Array.concat(out, [trimmed]);
      };
    };
    out
  };

  public func setTags(_current: [Text], tags: [Text]) : [Text] {
    dedupe(tags)
  };

  public func addTags(current: [Text], tags: [Text]) : [Text] {
    dedupe(Array.concat(current, tags))
  };

  public func removeTags(current: [Text], tags: [Text]) : [Text] {
    Array.filter<Text>(current, func(t) {
      not arrayContains(tags, t)
    })
  };

  private func contains(arr: [Text], item: Text) : Bool {
    for (t in arr.vals()) {
      if (t == item) return true;
    };
    false
  };

  private func arrayContains(arr: [Text], item: Text) : Bool {
    for (t in arr.vals()) {
      if (Text.toLower(t) == Text.toLower(item)) return true;
    };
    false
  };
};
