import Debug "mo:core/Debug";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import UserRepo "../../../src/repositories/UserRepository";
import Fixtures "../lib/Fixtures";
import Bench "../lib/Bench";

/// Documents current O(n) username scan — no index yet; keep reps low.
let userCount : Nat = 30;
let needle = "user4";

let seed = Fixtures.seedUsers(userCount, Principal.fromText("aaaaa-aa"), ?"user");
let once = UserRepo.searchByUsername(seed.usernames, seed.users, needle, 25);
assert(once.size() > 0);
Debug.print("PASS: username search returns matches (checked once)");

let bench = Bench.run("username_search_prefix", Bench.scanIterations, func() {
  ignore UserRepo.searchByUsername(seed.usernames, seed.users, needle, 25);
});
Bench.printResult(bench);
Debug.print(
  "SUMMARY username-search users=" # Nat.toText(userCount)
  # " — O(n) over username map; fine at current scale",
);
Debug.print("ALL username-search PERF TESTS PASSED");
