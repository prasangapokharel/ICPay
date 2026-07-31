import Debug "mo:core/Debug";
import UUID "../../src/utils/UUID";

let id1 = UUID.generate();
assert(id1.size() > 0);
Debug.print("PASS: UUID generates non-empty text:" # id1);

Debug.print("ALL UUID TESTS PASSED");
