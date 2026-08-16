import Result "../../pkg/errors/result";
import Pagination "../../pkg/pagination/pg";
import Id "../../pkg/uid/id";
import Duration "../../pkg/time/duration";
import Calendar "../../pkg/time/calendar";
import Response "../../pkg/api/response";
import Hex "../../pkg/crypto/hex";
import Hash "../../pkg/crypto/hash";
import HttpPath "../../pkg/http/path";
import HttpMime "../../pkg/http/mime";
import HttpStatus "../../pkg/http/status";
import Ttl "../../pkg/cache/ttl";
import MapCrud "../../pkg/crud/map";
import Rate "../../pkg/rate/window";
import ValidateText "../../pkg/validate/text";
import ValidateNat "../../pkg/validate/nat";
import BlobPkg "../../pkg/blob/blob";
import Utf8 "../../pkg/text/utf8";
import Search "../../pkg/text/search";
import Caller "../../pkg/principal/caller";
import Bounds "../../pkg/nat/bounds";
import Unwrap "../../pkg/option/unwrap";
import ArrayPage "../../pkg/array/page";
import SetOps "../../pkg/set/ops";
import Access "../../pkg/access/guard";
import AsyncIcp "../../pkg/async/icp";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

assert Result.isOk(Result.ok<Nat, Text>(1));
assert Result.unwrapOr(Result.err<Nat, Text>("x"), 0) == 0;

let page = Pagination.slice<Nat>([1, 2, 3, 4, 5], 0, 2, 10, 100);
assert page.total == 5 and page.items.size() == 2;

assert Id.withCounter("p", 3) == "p-3";
assert Duration.daysRemaining(Time.now() + Duration.days(2), Time.now()) >= 1;
assert Calendar.toIsoDate(Time.now()).size() == 10;

switch (Response.require(true, "fail")) {
  case (#ok(_)) {};
  case (#err(_)) { assert false };
};

assert Hex.isHex("deadbeef");
assert Hash.sha256Hex(Blob.fromArray([1, 2, 3])).size() == 64;
assert HttpPath.normalizePath("a") == "/a";
assert HttpMime.fromExtension("png") == "image/png";
assert HttpStatus.isSuccess(HttpStatus.ok());
assert ValidateText.absPath("/ok/file.txt") == null;
assert ValidateNat.positive(1, "amount") == null;

assert Utf8.byteLength("hello") == 5;
assert Search.containsIgnoreCase("Hello", "ell");
assert BlobPkg.take(Blob.fromArray([1, 2, 3]), 2).size() == 2;
assert Bounds.clamp(5, 0, 3) == 3;
assert Unwrap.getOr(?1, 0) == 1;
assert ArrayPage.chunkCount(100, 30) == 4;

let set = SetOps.textFromArray(["a", "b"]);
assert SetOps.textToArray(set).size() == 2;

ignore AsyncIcp.samePrincipal(Principal.fromText("aaaaa-aa"), Principal.fromText("aaaaa-aa"));

let cache = Ttl.empty<Text>();
Ttl.put(cache, "k", "v", Duration.seconds(60), Time.now());
switch (Ttl.get(cache, "k", Time.now())) {
  case (?v) { assert v == "v" };
  case null { assert false };
};

let store = Rate.empty();
assert Rate.allow(store, "user", { maxPerWindow = 2; windowSeconds = 60 }, Time.now());

let map = Map.empty<Text, Nat>();
MapCrud.upsert(map, Text.compare, "a", 1);
switch (MapCrud.getOrErr(map, Text.compare, "a", "missing")) {
  case (#ok(v)) { assert v == 1 };
  case (#err(_)) { assert false };
};

assert Caller.isAnonymous(Principal.fromText("2vxsx-fae"));
switch (Access.requireAuth(Principal.fromText("aaaaa-aa"))) {
  case (#ok(_)) {};
  case (#err(_)) { assert false };
};

"pkg smoke ok"
