import Cycles "mo:core/Cycles";

mixin () {
  public shared query func health() : async Text { "ok" };
  public shared query func get_cycles() : async Nat { Cycles.balance() };
};
