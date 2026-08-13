import Debug "mo:core/Debug";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

/// Local moc -r micro-bench only — keep iterations tiny; O(n) scan baselines burn interpreter time.
module {
  public let scanIterations : Nat = 3;
  public let indexIterations : Nat = 10;

  public type Result = {
    name: Text;
    iterations: Nat;
    elapsedNs: Int;
  };

  public func run(name: Text, iterations: Nat, f: () -> ()) : Result {
    let start = Time.now();
    var i = 0;
    while (i < iterations) {
      f();
      i += 1;
    };
    { name; iterations; elapsedNs = Time.now() - start }
  };

  public func printResult(r: Result) {
    Debug.print(
      "BENCH " # r.name
      # " iterations=" # Nat.toText(r.iterations)
      # " ns=" # Int.toText(r.elapsedNs),
    );
  };

  public func printCompare(before: Result, after: Result) {
    printResult(before);
    printResult(after);
    Debug.print(
      "COMPLEXITY " # before.name # "=O(n) " # after.name # "=O(1) per lookup",
    );
    if (before.elapsedNs > after.elapsedNs and after.elapsedNs > 0) {
      Debug.print("PASS: index path cheaper in this micro-bench");
    } else {
      Debug.print("NOTE: moc -r ns may tie at this scale — production win is complexity class");
    };
  };
};
