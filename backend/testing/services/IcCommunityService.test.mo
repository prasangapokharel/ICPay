import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import LedgerService "../../src/services/LedgerService";
import TransferService "../../src/services/TransferService";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import IcCommunityStorage "../../src/storage/IcCommunityStorage";
import IcCommunityService "../../src/services/IcCommunityService";
import UserRepo "../../src/repositories/UserRepository";
import Config "../../src/config/Config";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let channels = IcCommunityStorage.createChannelMap();
let members = IcCommunityStorage.createMemberMap();
let memberIndex = IcCommunityStorage.createMemberIndexMap();
let messages = IcCommunityStorage.createMessageMap();
let createLimits = RateLimitStorage.createRateLimitMap();
let joinLimits = RateLimitStorage.createRateLimitMap();
let postLimits = RateLimitStorage.createRateLimitMap();

let transactions = TxStorage.createTxList();
let transactionsByUser = TxStorage.createTxByUser();
let ledgerRegistry = LedgerStorage.createLedgerRegistry();
let ledger = LedgerService.create(Principal.fromText("aaaaa-aa"), ledgerRegistry);
let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
let transferLimits = RateLimitStorage.createRateLimitMap();
var uidCounter = 0;
func nextUid(): Text {
  uidCounter += 1;
  "tx-" # debug_show(uidCounter);
};

let transfers = TransferService.create(
  users,
  usernames,
  transactions,
  transactionsByUser,
  ledger,
  nextUid,
  transferLimits,
  depositSubaccounts,
  depositAccountIds,
);

let svc = IcCommunityService.create(
  users,
  usersById,
  channels,
  members,
  memberIndex,
  messages,
  transfers,
  createLimits,
  joinLimits,
  postLimits,
);

let owner = Principal.fromText("aaaaa-aa");
let guest = Principal.fromText("2vxsx-fae");
let stranger = Principal.fromText("mk4xk-sqaaa-aaaaa-qadjq-cai");
let now = Time.now();

let _ = UserRepo.create(users, usernames, usersById, "uid-owner", owner, ?"alpha", "alpha", now, null);
let _ = UserRepo.create(users, usernames, usersById, "uid-guest", guest, ?"guest", "guest", now, null);
let _ = UserRepo.create(users, usernames, usersById, "uid-stranger", stranger, ?"stranger", "stranger", now, null);

switch (IcCommunityService.createChannel(svc, owner, "Alpha Calls", "alpha_calls", "Daily alpha", #open, #free, 0, null)) {
  case (#ok(r)) {
    assert r.inviteCode == null;
    switch (IcCommunityService.getChannel(svc, r.channelId)) {
      case (?ch) {
        assert ch.slug == "alpha_calls";
        assert ch.memberCount == 1;
        Debug.print("PASS: create public free channel");
      };
      case (null) { assert false; Debug.print("FAIL: channel missing after create") };
    };
    switch (IcCommunityService.postMessage(svc, owner, r.channelId, "First post")) {
      case (#ok(msg)) {
        assert msg.text == "First post";
        Debug.print("PASS: owner posts message");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: post: " # e) };
    };
    switch (await IcCommunityService.joinChannel(svc, guest, r.channelId, null)) {
      case (#ok(ch)) {
        assert ch.memberCount == 2;
        Debug.print("PASS: guest joins free channel");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: join: " # e) };
    };
    switch (IcCommunityService.postMessage(svc, guest, r.channelId, "Guest post")) {
      case (#ok(_)) { assert false; Debug.print("FAIL: guest should not post") };
      case (#err(_)) { Debug.print("PASS: only creator can post") };
    };
    switch (IcCommunityService.listMessages(svc, guest, r.channelId, 0, 50)) {
      case (#ok(msgs)) {
        assert msgs.size() == 1;
        Debug.print("PASS: member reads messages");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: list messages: " # e) };
    };
    switch (IcCommunityService.pinMessage(svc, owner, r.channelId, 1)) {
      case (#ok(ch)) {
        switch (ch.pinnedMessageId) {
          case (?id) {
            assert id == 1;
            Debug.print("PASS: pin message");
          };
          case (null) { assert false; Debug.print("FAIL: pin not stored") };
        };
      };
      case (#err(e)) { assert false; Debug.print("FAIL: pin: " # e) };
    };
    switch (IcCommunityService.deleteMessage(svc, owner, r.channelId, 1)) {
      case (#ok(())) {
        switch (IcCommunityService.listMessages(svc, owner, r.channelId, 0, 50)) {
          case (#ok(msgs)) {
            assert msgs.size() == 0;
            Debug.print("PASS: delete hides message");
          };
          case (#err(e)) { assert false; Debug.print("FAIL: list after delete: " # e) };
        };
      };
      case (#err(e)) { assert false; Debug.print("FAIL: delete: " # e) };
    };
    let publicList = IcCommunityService.listPublicChannels(svc, 10, 0);
    assert publicList.size() == 1;
    Debug.print("PASS: public channel listed");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: create: " # e) };
};

switch (IcCommunityService.createChannel(svc, owner, "Secret", "secret_room", "", #inviteOnly, #free, 0, null)) {
  case (#ok(r)) {
    switch (r.inviteCode) {
      case (?code) {
        switch (await IcCommunityService.joinChannel(svc, stranger, r.channelId, ?code)) {
          case (#ok(_)) { Debug.print("PASS: private join with invite") };
          case (#err(e)) { assert false; Debug.print("FAIL: private join: " # e) };
        };
        switch (await IcCommunityService.joinChannel(svc, guest, r.channelId, null)) {
          case (#ok(_)) { assert false; Debug.print("FAIL: private join without code") };
          case (#err(e)) {
            assert e == "Invite code required";
            Debug.print("PASS: private join rejects missing code");
          };
        };
      };
      case (null) { assert false; Debug.print("FAIL: private channel missing invite") };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL: create private: " # e) };
};

switch (IcCommunityService.createChannel(svc, owner, "Paid", "paid_room", "", #open, #paid, Config.COMMUNITY_MIN_PRICE_E8S, null)) {
  case (#ok(_)) { Debug.print("PASS: create paid channel metadata") };
  case (#err(e)) { assert false; Debug.print("FAIL: create paid: " # e) };
};

switch (IcCommunityService.createChannel(svc, owner, "Bad", "bad_price", "", #open, #paid, 1, null)) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject low price") };
  case (#err(_)) { Debug.print("PASS: rejects price below 0.1 ICP") };
};

switch (IcCommunityService.listMyChannels(svc, owner)) {
  case (#ok(list)) {
    assert list.size() >= 3;
    Debug.print("PASS: list my channels");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: list my: " # e) };
};

Debug.print("IcCommunityService tests done");
