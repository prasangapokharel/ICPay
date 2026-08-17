import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import LiveRepo "../repositories/LiveRepository";
import UserStorage "../storage/UserStorage";
import LiveStorage "../storage/LiveStorage";
import ApiKeyCrypto "../utils/ApiKeyCrypto";
import Sha256 "../utils/Sha256";

module {
  public type LiveService = {
    users: UserStorage.UserMap;
    usersById: UserStorage.UserIdMap;
    rooms: LiveStorage.RoomMap;
    peers: LiveStorage.PeerMap;
    signals: LiveStorage.SignalMap;
    nextRoomId: () -> Text;
  };

  public func create(
    users: UserStorage.UserMap,
    usersById: UserStorage.UserIdMap,
    rooms: LiveStorage.RoomMap,
    peers: LiveStorage.PeerMap,
    signals: LiveStorage.SignalMap,
    nextRoomId: () -> Text,
  ): LiveService {
    { users; usersById; rooms; peers; signals; nextRoomId };
  };

  public func createRoom(
    service: LiveService,
    caller: Principal,
    title: Text,
    visibility: Types.LiveVisibility,
    inviteSecret: ?Text,
  ): Types.ApiResult<Types.LiveCreateResult> {
    switch (validateTitle(title)) {
      case (?err) return #err(err);
      case (null) {};
    };
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    if (LiveRepo.countActiveByHost(service.rooms, caller) >= LiveStorage.MAX_ACTIVE_ROOMS_PER_HOST) {
      return #err("Too many active rooms. End one first.");
    };
    let trimmed = trim(title);
    let roomId = shortId(service.nextRoomId());
    let (inviteHash, inviteToken) = switch (visibility) {
      case (#inviteOnly) {
        let token = switch (inviteSecret) {
          case (?s) s;
          case (null) ApiKeyCrypto.generateSecret(caller, roomId);
        };
        (?ApiKeyCrypto.hashSecret(token), ?token);
      };
      case (#open) { (null, null) };
    };
    let room: Types.LiveRoom = {
      id = roomId;
      title = trimmed;
      host = caller;
      visibility = visibility;
      inviteHash = inviteHash;
      state = #draft;
      createdAt = Time.now();
      endedAt = null;
    };
    LiveRepo.put(service.rooms, room);
    #ok({ roomId; inviteToken })
  };

  public func startRoom(service: LiveService, caller: Principal, roomId: Text): Types.ApiResult<Types.LiveRoomPublic> {
    switch (requireHost(service, caller, roomId)) {
      case (#err(e)) return #err(e);
      case (#ok(room)) {
        switch (room.state) {
          case (#draft or #paused) {
            let updated = { room with state = #live };
            LiveRepo.put(service.rooms, updated);
            #ok(toPublic(service, updated))
          };
          case (#live) { #err("Room is already live") };
          case (#ended) { #err("Room has ended") };
        };
      };
    };
  };

  public func pauseRoom(service: LiveService, caller: Principal, roomId: Text): Types.ApiResult<Types.LiveRoomPublic> {
    switch (requireHost(service, caller, roomId)) {
      case (#err(e)) return #err(e);
      case (#ok(room)) {
        if (room.state != #live) { return #err("Room is not live") };
        let updated = { room with state = #paused };
        LiveRepo.put(service.rooms, updated);
        #ok(toPublic(service, updated))
      };
    };
  };

  public func resumeRoom(service: LiveService, caller: Principal, roomId: Text): Types.ApiResult<Types.LiveRoomPublic> {
    startRoom(service, caller, roomId);
  };

  public func endRoom(service: LiveService, caller: Principal, roomId: Text): Types.ApiResult<()> {
    switch (requireHost(service, caller, roomId)) {
      case (#err(e)) return #err(e);
      case (#ok(room)) {
        if (room.state == #ended) { return #err("Room already ended") };
        let updated = {
          room with
          state = #ended;
          endedAt = ?Time.now();
        };
        LiveRepo.put(service.rooms, updated);
        LiveStorage.clearRoomTransient(service.peers, service.signals, roomId);
        #ok(())
      };
    };
  };

  public func joinRoom(
    service: LiveService,
    caller: Principal,
    roomId: Text,
    tabId: Text,
    inviteToken: ?Text,
  ): Types.ApiResult<Types.LiveRoomPublic> {
    switch (validateTabId(tabId)) {
      case (?err) return #err(err);
      case (null) {};
    };
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    switch (LiveRepo.get(service.rooms, roomId)) {
      case (null) return #err("Room not found");
      case (?room) {
        let isHost = room.host == caller;
        if (not isHost and room.state == #draft) {
          return #err("Room has not started yet");
        };
        if (room.state == #ended) { return #err("Room has ended") };
        switch (room.visibility) {
          case (#open) {};
          case (#inviteOnly) {
            switch (room.inviteHash, inviteToken) {
              case (null, _) return #err("Private room requires an invite");
              case (?_hash, null) return #err("Invite token required");
              case (?_hash, ?token) {
                if (_hash != ApiKeyCrypto.hashSecret(token)) {
                  return #err("Invalid invite token");
                };
              };
            };
          };
        };
        let peer: Types.LivePeer = { tabId; principal = caller; joinedAt = Time.now() };
        if (not LiveRepo.upsertPeer(service.peers, roomId, peer)) {
          return #err("Room is full");
        };
        #ok(toPublic(service, room))
      };
    };
  };

  public func leaveRoom(
    service: LiveService,
    caller: Principal,
    roomId: Text,
    tabId: Text,
  ): Types.ApiResult<()> {
    if (not LiveRepo.isPeer(service.peers, roomId, tabId, caller)) {
      return #err("Not in this room");
    };
    LiveRepo.removePeer(service.peers, roomId, tabId);
    #ok(())
  };

  public func postSignal(
    service: LiveService,
    caller: Principal,
    roomId: Text,
    tabId: Text,
    toTab: ?Text,
    payload: Text,
  ): Types.ApiResult<Nat> {
    if (payload.size() > LiveStorage.MAX_PAYLOAD) {
      return #err("Signal payload too large");
    };
    if (not LiveRepo.isPeer(service.peers, roomId, tabId, caller)) {
      return #err("Join the room first");
    };
    switch (LiveRepo.get(service.rooms, roomId)) {
      case (null) return #err("Room not found");
      case (?room) {
        if (room.state != #live) { return #err("Room is not live") };
        let box = LiveStorage.getMailbox(service.signals, roomId);
        box.nextId += 1;
        let msg: Types.LiveSignal = { id = box.nextId; fromTab = tabId; toTab; payload };
        let next = Array.concat(box.msgs, [msg]);
        box.msgs := if (next.size() > LiveStorage.MAX_SIGNALS) {
          Array.tabulate(LiveStorage.MAX_SIGNALS, func(i) { next[next.size() - LiveStorage.MAX_SIGNALS + i] })
        } else {
          next
        };
        #ok(msg.id)
      };
    };
  };

  public func pollSignals(
    service: LiveService,
    caller: Principal,
    roomId: Text,
    tabId: Text,
    afterId: Nat,
  ): Types.ApiResult<[Types.LiveSignal]> {
    if (not LiveRepo.isPeer(service.peers, roomId, tabId, caller)) {
      return #err("Join the room first");
    };
    switch (Map.get(service.signals, Text.compare, roomId)) {
      case (null) return #ok([]);
      case (?box) {
        let out = Array.filter<Types.LiveSignal>(box.msgs, func(m) {
          m.id > afterId and (switch (m.toTab) {
            case (null) true;
            case (?t) t == tabId;
          })
        });
        #ok(out)
      };
    };
  };

  public func getRoom(service: LiveService, roomId: Text): ?Types.LiveRoomPublic {
    switch (LiveRepo.get(service.rooms, roomId)) {
      case (null) null;
      case (?room) ?toPublic(service, room);
    };
  };

  public func listPublicRooms(service: LiveService, limit: Nat, offset: Nat): [Types.LiveRoomPublic] {
    Array.map<Types.LiveRoom, Types.LiveRoomPublic>(
      LiveRepo.listPublic(service.rooms, limit, offset),
      func(r) { toPublic(service, r) },
    )
  };

  public func listPeers(service: LiveService, roomId: Text): [Types.LivePeer] {
    LiveRepo.listPeers(service.peers, roomId);
  };

  private func toPublic(service: LiveService, room: Types.LiveRoom): Types.LiveRoomPublic {
    let hostUsername = switch (UserRepo.getByPrincipal(service.users, room.host)) {
      case (?u) u.username;
      case (null) null;
    };
    {
      id = room.id;
      title = room.title;
      host = room.host;
      hostUsername;
      visibility = room.visibility;
      state = room.state;
      peerCount = LiveRepo.peerCount(service.peers, room.id);
      createdAt = room.createdAt;
    }
  };

  private func requireUser(service: LiveService, caller: Principal): Types.ApiResult<Types.User> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?u) #ok(u);
      case (null) #err("User not found");
    };
  };

  private func requireHost(
    service: LiveService,
    caller: Principal,
    roomId: Text,
  ): Types.ApiResult<Types.LiveRoom> {
    switch (LiveRepo.get(service.rooms, roomId)) {
      case (null) #err("Room not found");
      case (?room) {
        if (room.host != caller) { #err("Only the host can do this") }
        else { #ok(room) };
      };
    };
  };

  private func validateTitle(title: Text): ?Text {
    let t = trim(title);
    if (t.size() == 0) { ?"Title is required" }
    else if (t.size() > LiveStorage.MAX_TITLE) { ?"Title is too long" }
    else null;
  };

  private func validateTabId(tabId: Text): ?Text {
    if (tabId.size() == 0 or tabId.size() > LiveStorage.MAX_TAB_ID) {
      ?"Invalid tab id"
    } else {
      null
    };
  };

  private func trim(text: Text): Text {
    Text.trim(text, #char ' ');
  };

  private func shortId(raw: Text): Text {
    let digest = Sha256.toHex(Blob.toArray(Sha256.sha256Blob(Text.encodeUtf8(raw))));
    takeChars(digest, 8);
  };

  func takeChars(t: Text, n: Nat): Text {
    var out = "";
    var count = 0;
    label slice for (c in t.chars()) {
      if (count >= n) break slice;
      out #= Char.toText(c);
      count += 1;
    };
    out;
  };
};
