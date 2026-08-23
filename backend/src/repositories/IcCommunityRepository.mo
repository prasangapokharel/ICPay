import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";
import IcCommunityStorage "../storage/IcCommunityStorage";

module {
  public func get(channels: IcCommunityStorage.ChannelMap, channelId: Text): ?Types.CommunityChannel {
    Map.get(channels, Text.compare, channelId);
  };

  public func put(channels: IcCommunityStorage.ChannelMap, channel: Types.CommunityChannel) {
    Map.add(channels, Text.compare, channel.id, channel);
  };

  public func existsBySlug(channels: IcCommunityStorage.ChannelMap, slug: Text): Bool {
    switch (Map.get(channels, Text.compare, slug)) {
      case (?_) true;
      case (null) false;
    };
  };

  public func countByOwner(channels: IcCommunityStorage.ChannelMap, owner: Principal): Nat {
    var n = 0;
    for ((_, ch) in Map.entries(channels)) {
      if (ch.owner == owner) { n += 1 };
    };
    n;
  };

  public func listPublic(
    channels: IcCommunityStorage.ChannelMap,
    limit: Nat,
    offset: Nat,
  ): [Types.CommunityChannel] {
    let openList = List.empty<Types.CommunityChannel>();
    for ((_, ch) in Map.entries(channels)) {
      if (ch.visibility == #open) {
        List.add(openList, ch);
      };
    };
    let all = List.toArray(openList);
    let sorted = Array.sort(all, func(a: Types.CommunityChannel, b: Types.CommunityChannel): { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal }
    });
    let start = Nat.min(offset, sorted.size());
    let end = Nat.min(start + limit, sorted.size());
    Array.tabulate<Types.CommunityChannel>(end - start, func(i) { sorted[start + i] });
  };

  public func isMember(
    members: IcCommunityStorage.MemberMap,
    channelId: Text,
    principal: Principal,
  ): Bool {
    switch (Map.get(members, Text.compare, IcCommunityStorage.memberKey(channelId, principal))) {
      case (?_) true;
      case (null) false;
    };
  };

  public func addMember(
    members: IcCommunityStorage.MemberMap,
    index: IcCommunityStorage.MemberIndexMap,
    channelId: Text,
    principal: Principal,
    joinedAt: Int,
  ) {
    let key = IcCommunityStorage.memberKey(channelId, principal);
    Map.add(members, Text.compare, key, { joinedAt });
    let existing = switch (Map.get(index, Principal.compare, principal)) {
      case (?ids) ids;
      case (null) [];
    };
    if (not containsChannelId(existing, channelId)) {
      Map.add(index, Principal.compare, principal, Array.concat(existing, [channelId]));
    };
  };

  public func removeMember(
    members: IcCommunityStorage.MemberMap,
    index: IcCommunityStorage.MemberIndexMap,
    channelId: Text,
    principal: Principal,
  ): Bool {
    if (not isMember(members, channelId, principal)) {
      return false;
    };
    let key = IcCommunityStorage.memberKey(channelId, principal);
    Map.remove(members, Text.compare, key);
    switch (Map.get(index, Principal.compare, principal)) {
      case (?ids) {
        let next = Array.filter(ids, func(id: Text): Bool { id != channelId });
        if (next.size() == 0) {
          Map.remove(index, Principal.compare, principal);
        } else {
          Map.add(index, Principal.compare, principal, next);
        };
      };
      case (null) {};
    };
    true;
  };

  public func listMemberChannelIds(
    index: IcCommunityStorage.MemberIndexMap,
    principal: Principal,
  ): [Text] {
    switch (Map.get(index, Principal.compare, principal)) {
      case (?ids) ids;
      case (null) [];
    };
  };

  func containsChannelId(ids: [Text], channelId: Text): Bool {
    for (id in ids.vals()) {
      if (id == channelId) { return true };
    };
    false;
  };
};
