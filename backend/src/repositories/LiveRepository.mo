import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";
import LiveStorage "../storage/LiveStorage";

module {
  public func get(rooms: LiveStorage.RoomMap, roomId: Text): ?Types.LiveRoom {
    Map.get(rooms, Text.compare, roomId);
  };

  public func put(rooms: LiveStorage.RoomMap, room: Types.LiveRoom) {
    Map.add(rooms, Text.compare, room.id, room);
  };

  public func listPublic(
    rooms: LiveStorage.RoomMap,
    limit: Nat,
    offset: Nat,
  ): [Types.LiveRoom] {
    let liveList = List.empty<Types.LiveRoom>();
    for ((_, room) in Map.entries(rooms)) {
      if (room.visibility == #open and (room.state == #live or room.state == #paused)) {
        List.add(liveList, room);
      };
    };
    let live = List.toArray(liveList);
    let sorted = Array.sort(live, func(a: Types.LiveRoom, b: Types.LiveRoom): { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal }
    });
    let start = Nat.min(offset, sorted.size());
    let end = Nat.min(start + limit, sorted.size());
    Array.tabulate<Types.LiveRoom>(end - start, func(i) { sorted[start + i] });
  };

  public func countActiveByHost(rooms: LiveStorage.RoomMap, host: Principal): Nat {
    var n = 0;
    for ((_, room) in Map.entries(rooms)) {
      if (room.host == host and room.state != #ended) { n += 1 };
    };
    n;
  };

  public func peerCount(peers: LiveStorage.PeerMap, roomId: Text): Nat {
    switch (Map.get(peers, Text.compare, roomId)) {
      case (?list) List.size(list);
      case (null) 0;
    };
  };

  public func listPeers(peers: LiveStorage.PeerMap, roomId: Text): [Types.LivePeer] {
    switch (Map.get(peers, Text.compare, roomId)) {
      case (?list) List.toArray(list);
      case (null) [];
    };
  };

  public func upsertPeer(
    peers: LiveStorage.PeerMap,
    roomId: Text,
    peer: Types.LivePeer,
  ): Bool {
    let prior = switch (Map.get(peers, Text.compare, roomId)) {
      case (?l) l;
      case (null) List.empty<Types.LivePeer>();
    };
    // One seat per principal — refresh/re-enter mints a new tabId; drop stale tabs.
    let withoutPrincipal = List.filter(prior, func(p: Types.LivePeer): Bool {
      p.principal != peer.principal
    });
    if (List.any(withoutPrincipal, func(p: Types.LivePeer): Bool { p.tabId == peer.tabId })) {
      let next = List.map<Types.LivePeer, Types.LivePeer>(withoutPrincipal, func(p) {
        if (p.tabId == peer.tabId) peer else p
      });
      Map.add(peers, Text.compare, roomId, next);
      return true;
    };
    if (withoutPrincipal.size() >= LiveStorage.MAX_PEERS) { return false };
    List.add(withoutPrincipal, peer);
    Map.add(peers, Text.compare, roomId, withoutPrincipal);
    true
  };

  public func removePeer(peers: LiveStorage.PeerMap, roomId: Text, tabId: Text) {
    switch (Map.get(peers, Text.compare, roomId)) {
      case (?l) {
        let next = List.filter(l, func(p: Types.LivePeer): Bool { p.tabId != tabId });
        if (next.size() == 0) {
          Map.remove(peers, Text.compare, roomId);
        } else {
          Map.add(peers, Text.compare, roomId, next);
        };
      };
      case (null) {};
    };
  };

  public func isPeer(
    peers: LiveStorage.PeerMap,
    roomId: Text,
    tabId: Text,
    caller: Principal,
  ): Bool {
    switch (Map.get(peers, Text.compare, roomId)) {
      case (?l) {
        List.any(l, func(p: Types.LivePeer): Bool {
          p.tabId == tabId and p.principal == caller
        })
      };
      case (null) false;
    };
  };
};
