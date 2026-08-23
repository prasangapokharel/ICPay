import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types";
import Config "../config/Config";
import UserRepo "../repositories/UserRepository";
import IcCommunityRepo "../repositories/IcCommunityRepository";
import IcCommunityValidator "../validators/IcCommunityValidator";
import UserStorage "../storage/UserStorage";
import IcCommunityStorage "../storage/IcCommunityStorage";
import NatBounds "../../pkg/nat/bounds";
import TransferService "TransferService";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";
import ApiKeyCrypto "../utils/ApiKeyCrypto";

module {
  public type IcCommunityService = {
    users: UserStorage.UserMap;
    usersById: UserStorage.UserIdMap;
    channels: IcCommunityStorage.ChannelMap;
    members: IcCommunityStorage.MemberMap;
    memberIndex: IcCommunityStorage.MemberIndexMap;
    messages: IcCommunityStorage.MessageMap;
    transfers: TransferService.TransferService;
    createLimits: RateLimitStorage.RateLimitMap;
    joinLimits: RateLimitStorage.RateLimitMap;
    postLimits: RateLimitStorage.RateLimitMap;
  };

  public func create(
    users: UserStorage.UserMap,
    usersById: UserStorage.UserIdMap,
    channels: IcCommunityStorage.ChannelMap,
    members: IcCommunityStorage.MemberMap,
    memberIndex: IcCommunityStorage.MemberIndexMap,
    messages: IcCommunityStorage.MessageMap,
    transfers: TransferService.TransferService,
    createLimits: RateLimitStorage.RateLimitMap,
    joinLimits: RateLimitStorage.RateLimitMap,
    postLimits: RateLimitStorage.RateLimitMap,
  ): IcCommunityService {
    { users; usersById; channels; members; memberIndex; messages; transfers; createLimits; joinLimits; postLimits };
  };

  public func createChannel(
    service: IcCommunityService,
    caller: Principal,
    name: Text,
    slug: Text,
    bio: Text,
    visibility: Types.CommunityVisibility,
    access: Types.CommunityAccess,
    priceE8s: Nat,
    inviteSecret: ?Text,
  ): Types.ApiResult<Types.CommunityCreateResult> {
    if (not RateLimitService.allow(service.createLimits, caller, Config.RATE_COMMUNITY_CREATE, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_COMMUNITY_CREATE));
    };
    switch (IcCommunityValidator.validateName(name)) {
      case (?e) return #err(e);
      case (null) {};
    };
    switch (IcCommunityValidator.validateSlug(slug)) {
      case (?e) return #err(e);
      case (null) {};
    };
    switch (IcCommunityValidator.validateBio(bio)) {
      case (?e) return #err(e);
      case (null) {};
    };
    switch (IcCommunityValidator.validatePrice(access, priceE8s)) {
      case (?e) return #err(e);
      case (null) {};
    };
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    let channelSlug = IcCommunityValidator.normalizeSlug(slug);
    if (IcCommunityRepo.existsBySlug(service.channels, channelSlug)) {
      return #err("Channel username is already taken");
    };
    if (IcCommunityRepo.countByOwner(service.channels, caller) >= Config.MAX_COMMUNITY_CHANNELS_PER_OWNER) {
      return #err("Too many channels. Delete or leave one first.");
    };
    let trimmedName = trim(name);
    let trimmedBio = trim(bio);
    let (inviteHash, inviteCode) = switch (visibility) {
      case (#open) { (null, null) };
      case (#inviteOnly) {
        let token = switch (inviteSecret) {
          case (?s) s;
          case (null) ApiKeyCrypto.generateSecret(caller, channelSlug);
        };
        (?ApiKeyCrypto.hashSecret(token), ?token);
      };
    };
    let now = Time.now();
    let channel: Types.CommunityChannel = {
      id = channelSlug;
      name = trimmedName;
      slug = channelSlug;
      owner = caller;
      bio = trimmedBio;
      visibility = visibility;
      access = access;
      priceE8s = priceE8s;
      inviteHash = inviteHash;
      pinnedMessageId = null;
      memberCount = 1;
      createdAt = now;
    };
    IcCommunityRepo.put(service.channels, channel);
    IcCommunityRepo.addMember(service.members, service.memberIndex, channelSlug, caller, now);
    #ok({ channelId = channelSlug; inviteCode })
  };

  public func joinChannel(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
    inviteCode: ?Text,
  ): async Types.ApiResult<Types.CommunityChannelPublic> {
    if (not RateLimitService.allow(service.joinLimits, caller, Config.RATE_COMMUNITY_JOIN, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_COMMUNITY_JOIN));
    };
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) return #err("Channel not found");
      case (?channel) {
        if (IcCommunityRepo.isMember(service.members, channelId, caller)) {
          return #err("Already joined");
        };
        switch (channel.visibility) {
          case (#open) {};
          case (#inviteOnly) {
            switch (channel.inviteHash, inviteCode) {
              case (null, _) return #err("Private channel requires an invite");
              case (?_hash, null) return #err("Invite code required");
              case (?_hash, ?code) {
                if (_hash != ApiKeyCrypto.hashSecret(code)) {
                  return #err("Invalid invite code");
                };
              };
            };
          };
        };
        switch (channel.access) {
          case (#free) {};
          case (#paid) {
            let payResult = await TransferService.transferByPrincipal(
              service.transfers,
              caller,
              Config.ICP_LEDGER_CANISTER_ID,
              channel.owner,
              channel.priceE8s,
              ?("icCommunity:" # channelId),
            );
            switch (payResult) {
              case (#err(e)) return #err(e);
              case (#ok(_)) {};
            };
          };
        };
        let now = Time.now();
        IcCommunityRepo.addMember(service.members, service.memberIndex, channelId, caller, now);
        let updated = {
          channel with
          memberCount = channel.memberCount + 1;
        };
        IcCommunityRepo.put(service.channels, updated);
        #ok(toPublic(service, updated))
      };
    };
  };

  public func leaveChannel(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
  ): Types.ApiResult<()> {
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) return #err("Channel not found");
      case (?channel) {
        if (channel.owner == caller) {
          return #err("Channel owner cannot leave. Delete the channel instead.");
        };
        if (not IcCommunityRepo.removeMember(service.members, service.memberIndex, channelId, caller)) {
          return #err("Not a member");
        };
        let updated = {
          channel with
          memberCount = Nat.max(1, NatBounds.saturatingSub(channel.memberCount, 1));
        };
        IcCommunityRepo.put(service.channels, updated);
        #ok(())
      };
    };
  };

  public func postMessage(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
    text: Text,
  ): Types.ApiResult<Types.CommunityMessagePublic> {
    if (not RateLimitService.allow(service.postLimits, caller, Config.RATE_COMMUNITY_POST, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_COMMUNITY_POST));
    };
    switch (IcCommunityValidator.validateMessage(text)) {
      case (?e) return #err(e);
      case (null) {};
    };
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) return #err("Channel not found");
      case (?channel) {
        if (channel.owner != caller) {
          return #err("Only the channel creator can post");
        };
        let trimmed = trim(text);
        let box = IcCommunityStorage.getMailbox(service.messages, channelId);
        box.nextId += 1;
        let msg: Types.CommunityMessage = {
          id = box.nextId;
          author = caller;
          text = trimmed;
          createdAt = Time.now();
          deleted = false;
        };
        let next = Array.concat(box.msgs, [msg]);
        box.msgs := if (next.size() > IcCommunityStorage.MAX_MESSAGES) {
          Array.tabulate(IcCommunityStorage.MAX_MESSAGES, func(i) {
            next[next.size() - IcCommunityStorage.MAX_MESSAGES + i]
          })
        } else {
          next
        };
        #ok(messageToPublic(service, msg))
      };
    };
  };

  public func pinMessage(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
    messageId: Nat,
  ): Types.ApiResult<Types.CommunityChannelPublic> {
    switch (requireOwner(service, caller, channelId)) {
      case (#err(e)) return #err(e);
      case (#ok(channel)) {
        switch (findMessage(service.messages, channelId, messageId)) {
          case (null) return #err("Message not found");
          case (?msg) {
            if (msg.deleted) { return #err("Cannot pin a deleted message") };
            let updated = { channel with pinnedMessageId = ?messageId };
            IcCommunityRepo.put(service.channels, updated);
            #ok(toPublic(service, updated))
          };
        };
      };
    };
  };

  public func deleteMessage(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
    messageId: Nat,
  ): Types.ApiResult<()> {
    switch (requireOwner(service, caller, channelId)) {
      case (#err(e)) return #err(e);
      case (#ok(channel)) {
        let box = IcCommunityStorage.getMailbox(service.messages, channelId);
        var found = false;
        let next = Array.map<Types.CommunityMessage, Types.CommunityMessage>(box.msgs, func(m) {
          if (m.id == messageId and not m.deleted) {
            found := true;
            { m with deleted = true }
          } else {
            m
          }
        });
        if (not found) { return #err("Message not found") };
        box.msgs := next;
        if (channel.pinnedMessageId == ?messageId) {
          let cleared = { channel with pinnedMessageId = null };
          IcCommunityRepo.put(service.channels, cleared);
        };
        #ok(())
      };
    };
  };

  public func getChannel(service: IcCommunityService, channelId: Text): ?Types.CommunityChannelPublic {
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) null;
      case (?ch) ?toPublic(service, ch);
    };
  };

  public func listPublicChannels(
    service: IcCommunityService,
    limit: Nat,
    offset: Nat,
  ): [Types.CommunityChannelPublic] {
    let cap = Nat.min(limit, IcCommunityStorage.MAX_LIST);
    Array.map<Types.CommunityChannel, Types.CommunityChannelPublic>(
      IcCommunityRepo.listPublic(service.channels, cap, offset),
      func(ch) { toPublic(service, ch) },
    )
  };

  public func listMyChannels(
    service: IcCommunityService,
    caller: Principal,
  ): Types.ApiResult<[Types.CommunityChannelPublic]> {
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {
        let ids = IcCommunityRepo.listMemberChannelIds(service.memberIndex, caller);
        let buf = List.empty<Types.CommunityChannelPublic>();
        for (id in ids.vals()) {
          switch (IcCommunityRepo.get(service.channels, id)) {
            case (?ch) List.add(buf, toPublic(service, ch));
            case (null) {};
          };
        };
        #ok(List.toArray(buf))
      };
    };
  };

  public func listMessages(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
    afterId: Nat,
    limit: Nat,
  ): Types.ApiResult<[Types.CommunityMessagePublic]> {
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) return #err("Channel not found");
      case (?channel) {
        if (not canRead(service, caller, channel)) {
          return #err("Join the channel to read messages");
        };
        let cap = Nat.min(limit, IcCommunityStorage.MAX_LIST);
        switch (Map.get(service.messages, Text.compare, channelId)) {
          case (null) return #ok([]);
          case (?box) {
            let visible = Array.filter<Types.CommunityMessage>(box.msgs, func(m) {
              m.id > afterId and not m.deleted
            });
            let size = visible.size();
            let start = if (size > cap) { NatBounds.saturatingSub(size, cap) } else { 0 };
            let count = NatBounds.saturatingSub(size, start);
            #ok(Array.tabulate<Types.CommunityMessagePublic>(count, func(i) {
              messageToPublic(service, visible[start + i])
            }))
          };
        };
      };
    };
  };

  public func isMember(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
  ): Bool {
    IcCommunityRepo.isMember(service.members, channelId, caller);
  };

  private func canRead(
    service: IcCommunityService,
    caller: Principal,
    channel: Types.CommunityChannel,
  ): Bool {
    if (channel.owner == caller) { return true };
    if (IcCommunityRepo.isMember(service.members, channel.id, caller)) { return true };
    channel.visibility == #open and channel.access == #free
  };

  private func requireUser(service: IcCommunityService, caller: Principal): Types.ApiResult<Types.User> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?u) #ok(u);
      case (null) #err("User not found");
    };
  };

  private func requireOwner(
    service: IcCommunityService,
    caller: Principal,
    channelId: Text,
  ): Types.ApiResult<Types.CommunityChannel> {
    switch (IcCommunityRepo.get(service.channels, channelId)) {
      case (null) #err("Channel not found");
      case (?ch) {
        if (ch.owner != caller) { #err("Only the channel creator can do this") }
        else { #ok(ch) };
      };
    };
  };

  private func findMessage(
    messages: IcCommunityStorage.MessageMap,
    channelId: Text,
    messageId: Nat,
  ): ?Types.CommunityMessage {
    switch (Map.get(messages, Text.compare, channelId)) {
      case (null) null;
      case (?box) {
        Array.find(box.msgs, func(m: Types.CommunityMessage): Bool { m.id == messageId })
      };
    };
  };

  private func toPublic(service: IcCommunityService, channel: Types.CommunityChannel): Types.CommunityChannelPublic {
    let ownerUsername = switch (UserRepo.getByPrincipal(service.users, channel.owner)) {
      case (?u) u.username;
      case (null) null;
    };
    {
      id = channel.id;
      name = channel.name;
      slug = channel.slug;
      owner = channel.owner;
      ownerUsername;
      bio = channel.bio;
      visibility = channel.visibility;
      access = channel.access;
      priceE8s = channel.priceE8s;
      pinnedMessageId = channel.pinnedMessageId;
      memberCount = channel.memberCount;
      createdAt = channel.createdAt;
    }
  };

  private func messageToPublic(
    service: IcCommunityService,
    msg: Types.CommunityMessage,
  ): Types.CommunityMessagePublic {
    let authorUsername = switch (UserRepo.getByPrincipal(service.users, msg.author)) {
      case (?u) u.username;
      case (null) null;
    };
    {
      id = msg.id;
      author = msg.author;
      authorUsername;
      text = msg.text;
      createdAt = msg.createdAt;
    }
  };

  private func trim(text: Text): Text {
    Text.trim(text, #char ' ');
  };
};
