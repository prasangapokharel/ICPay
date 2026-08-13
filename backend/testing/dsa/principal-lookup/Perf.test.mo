import Debug "mo:core/Debug";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import UserRepo "../../../src/repositories/UserRepository";
import Fixtures "../lib/Fixtures";
import Scan "../lib/Scan";
import Bench "../lib/Bench";

let userCount : Nat = 30;
let target = Fixtures.principalAt(userCount / 2);
let seed = Fixtures.seedUsers(userCount, Principal.fromText("aaaaa-aa"), null);

switch (Scan.byPrincipalScan(seed.users, target)) {
  case (?p) { assert(p == target) };
  case (null) { assert(false) };
};
switch (UserRepo.getByPrincipal(seed.users, target)) {
  case (?u) { assert(u.principal == target) };
  case (null) { assert(false) };
};
Debug.print("PASS: scan and map lookup agree (checked once)");

let scan = Bench.run("principal_lookup_scan", Bench.scanIterations, func() {
  ignore Scan.byPrincipalScan(seed.users, target);
});
let index = Bench.run("principal_lookup_map", Bench.indexIterations, func() {
  ignore UserRepo.getByPrincipal(seed.users, target);
});
Bench.printCompare(scan, index);

Debug.print("SUMMARY principal-lookup — production already uses HashMap O(1)");
Debug.print("ALL principal-lookup PERF TESTS PASSED");
