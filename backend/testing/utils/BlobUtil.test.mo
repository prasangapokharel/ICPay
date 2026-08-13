import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import BlobUtil "../../src/utils/BlobUtil";

let a = Blob.fromArray([1, 2, 3]);
let b = Blob.fromArray([4, 5]);
let joined = BlobUtil.join(a, b);
assert joined.size() == 5;
assert Blob.toArray(joined) == [1, 2, 3, 4, 5];
Debug.print("PASS: BlobUtil.join");

let c = Blob.fromArray([6]);
let merged = BlobUtil.concat([a, b, c]);
assert merged.size() == 6;
Debug.print("PASS: BlobUtil.concat");

Debug.print("ALL BLOB UTIL TESTS PASSED");
