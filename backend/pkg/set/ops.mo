import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  public func textFromArray(items: [Text]) : Set.Set<Text> {
    let out = Set.empty<Text>();
    for (item in items.vals()) { out.add(item) };
    out
  };

  public func textToArray(set: Set.Set<Text>) : [Text] {
    Iter.toArray(set.values())
  };

  public func principalFromArray(items: [Principal]) : Set.Set<Principal> {
    let out = Set.empty<Principal>();
    for (item in items.vals()) { out.add(item) };
    out
  };

  public func principalToArray(set: Set.Set<Principal>) : [Principal] {
    Iter.toArray(set.values())
  };
};
