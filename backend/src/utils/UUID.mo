import Time "mo:core/Time";
import Int "mo:core/Int";

module {
  public func generate(): Text {
    Time.now().toText();
  };
};
