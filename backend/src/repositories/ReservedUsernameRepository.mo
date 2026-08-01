import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func isReserved(reserved: ReservedStorage.ReservedUsernameSet, name: Text): Bool {
    reserved.contains(UsernameValidator.normalize(name));
  };

  public func reserve(reserved: ReservedStorage.ReservedUsernameSet, name: Text) {
    reserved.add(UsernameValidator.normalize(name));
  };

  public func release(reserved: ReservedStorage.ReservedUsernameSet, name: Text) {
    reserved.remove(UsernameValidator.normalize(name));
  };

  public func list(reserved: ReservedStorage.ReservedUsernameSet): [Text] {
    let names = List.empty<Text>();
    for (name in reserved.values()) { names.add(name) };
    List.toArray(names);
  };
};
