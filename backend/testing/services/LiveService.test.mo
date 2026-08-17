import Debug "mo:core/Debug";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import LiveStorage "../../src/storage/LiveStorage";
import LiveService "../../src/services/LiveService";
import UserRepo "../../src/repositories/UserRepository";
import Types "../../src/types";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let rooms = LiveStorage.createRoomMap();
let peers = LiveStorage.createPeerMap();
let signals = LiveStorage.createSignalMap();
var idCounter = 0;
func nextRoomId(): Text {
  idCounter += 1;
  "room-" # Int.toText(idCounter);
};
let svc = LiveService.create(users, usersById, rooms, peers, signals, nextRoomId);

let host = Principal.fromText("aaaaa-aa");
let guest = Principal.fromText("2vxsx-fae");
let now = Time.now();

let _ = UserRepo.create(users, usernames, usersById, "uid-host", host, ?"host", "host", now, null);
let _ = UserRepo.create(users, usernames, usersById, "uid-guest", guest, ?"guest", "guest", now, null);

switch (LiveService.createRoom(svc, host, "Weekly sync", #open, null)) {
  case (#ok(r)) {
    assert r.inviteToken == null;
    switch (LiveService.getRoom(svc, r.roomId)) {
      case (?room) {
        assert room.state == #draft;
        Debug.print("PASS: create public room");
      };
      case (null) { assert false; Debug.print("FAIL: room missing after create") };
    };
    switch (LiveService.joinRoom(svc, host, r.roomId, "tab-host", null)) {
      case (#ok(_)) { Debug.print("PASS: host joins draft room") };
      case (#err(e)) { assert false; Debug.print("FAIL: host join: " # e) };
    };
    switch (LiveService.startRoom(svc, host, r.roomId)) {
      case (#ok(room)) {
        assert room.state == #live;
        Debug.print("PASS: start room");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: start: " # e) };
    };
    switch (LiveService.joinRoom(svc, guest, r.roomId, "tab-guest", null)) {
      case (#ok(_)) { Debug.print("PASS: guest joins live room") };
      case (#err(e)) { assert false; Debug.print("FAIL: guest join: " # e) };
    };
    let peerList = LiveService.listPeers(svc, r.roomId);
    assert peerList.size() >= 2;
    switch (Array.find(peerList, func(p: Types.LivePeerPublic): Bool { p.tabId == "tab-guest" })) {
      case (?guestPeer) {
        switch (guestPeer.username) {
          case (?u) {
            assert u == "guest";
            Debug.print("PASS: peer list includes username");
          };
          case (null) { assert false; Debug.print("FAIL: guest peer missing username") };
        };
      };
      case (null) { assert false; Debug.print("FAIL: guest peer not in list") };
    };
    switch (LiveService.postSignal(svc, host, r.roomId, "tab-host", ?"tab-guest", "{\"type\":\"offer\"}")) {
      case (#ok(id)) {
        assert id == 1;
        switch (LiveService.pollSignals(svc, guest, r.roomId, "tab-guest", 0)) {
          case (#ok(msgs)) {
            assert msgs.size() == 1;
            Debug.print("PASS: signal post and poll");
          };
          case (#err(e)) { assert false; Debug.print("FAIL: poll: " # e) };
        };
      };
      case (#err(e)) { assert false; Debug.print("FAIL: post signal: " # e) };
    };
    switch (LiveService.pauseRoom(svc, host, r.roomId)) {
      case (#ok(room)) {
        assert room.state == #paused;
        Debug.print("PASS: pause room");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: pause: " # e) };
    };
    switch (LiveService.resumeRoom(svc, host, r.roomId)) {
      case (#ok(room)) {
        assert room.state == #live;
        Debug.print("PASS: resume room");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: resume: " # e) };
    };
    switch (LiveService.endRoom(svc, host, r.roomId)) {
      case (#ok(())) { Debug.print("PASS: end room") };
      case (#err(e)) { assert false; Debug.print("FAIL: end: " # e) };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL: create: " # e) };
};

switch (LiveService.createRoom(svc, host, "Secret", #inviteOnly, null)) {
  case (#ok(r)) {
    switch (r.inviteToken) {
      case (?token) {
        ignore LiveService.joinRoom(svc, host, r.roomId, "tab-h2", null);
        ignore LiveService.startRoom(svc, host, r.roomId);
        switch (LiveService.joinRoom(svc, guest, r.roomId, "tab-g2", null)) {
          case (#ok(_)) { assert false; Debug.print("FAIL: guest join private without token") };
          case (#err(_)) { Debug.print("PASS: private room rejects missing token") };
        };
        switch (LiveService.joinRoom(svc, guest, r.roomId, "tab-g2", ?token)) {
          case (#ok(_)) { Debug.print("PASS: guest joins with invite token") };
          case (#err(e)) { assert false; Debug.print("FAIL: guest private join: " # e) };
        };
      };
      case (null) { assert false; Debug.print("FAIL: private room missing token") };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL: private create: " # e) };
};

Debug.print("LiveService tests done");
