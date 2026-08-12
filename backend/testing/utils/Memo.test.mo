import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Config "../../src/config/Config";
import Memo "../../src/utils/Memo";

assert (Memo.byteLength(Memo.bucketCreate("a", 1)) <= Config.MEMO_MAX_BYTES);
assert (Memo.byteLength(Memo.bucketCreate("abcdefghijklmnopqrstuvwxyz012345", 500)) <= Config.MEMO_MAX_BYTES);
assert (Memo.byteLength(Memo.bucketRenew("abcdefghijklmnopqrstuvwxyz012345")) <= Config.MEMO_MAX_BYTES);
assert (Text.startsWith(Memo.bucketCreate("photos", 10), #text "B:photos:10G"));
Debug.print("PASS: bucket memos fit ledger limit");

Debug.print("Memo tests done");
