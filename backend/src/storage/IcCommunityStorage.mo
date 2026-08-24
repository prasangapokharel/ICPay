import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";

module {
  public type ChannelMap = Map.Map<Text, Types.CommunityChannel>;
  public type MemberMap = Map.Map<Text, Types.CommunityMember>;
  public type MemberIndexMap = Map.Map<Principal, [Text]>;
  public type MessageMailbox = {
    var nextId: Nat;
    var msgs: [Types.CommunityMessage];
  };
  public type MessageMap = Map.Map<Text, MessageMailbox>;
  public type ReactionVoteMap = Map.Map<Text, Nat8>;
  public type ReactionCountMap = Map.Map<Text, [Nat]>;

  public let MAX_NAME = 80;
  public let MAX_BIO = 280;
  public let MIN_SLUG = 3;
  public let MAX_SLUG = 32;
  public let MAX_MESSAGE = 2_000;
  public let MAX_MESSAGES = 2_000;
  public let MAX_LIST = 50;
  public let MAX_CHANNEL_AVATAR_BYTES = 10_000;
  public let MAX_REACTION_CODE: Nat8 = 4;
  public let REACTION_SLOT_COUNT: Nat = 4;

  public func createChannelMap(): ChannelMap {
    Map.empty<Text, Types.CommunityChannel>();
  };

  public func createMemberMap(): MemberMap {
    Map.empty<Text, Types.CommunityMember>();
  };

  public func createMemberIndexMap(): MemberIndexMap {
    Map.empty<Principal, [Text]>();
  };

  public func createMessageMap(): MessageMap {
    Map.empty<Text, MessageMailbox>();
  };

  public func createReactionVoteMap(): ReactionVoteMap {
    Map.empty<Text, Nat8>();
  };

  public func createReactionCountMap(): ReactionCountMap {
    Map.empty<Text, [Nat]>();
  };

  public func emptyReactionCounts(): [Nat] {
    [0, 0, 0, 0];
  };

  public func reactionVoteKey(channelId: Text, messageId: Nat, principal: Principal): Text {
    channelId # ":" # Nat.toText(messageId) # ":" # Principal.toText(principal);
  };

  public func reactionCountKey(channelId: Text, messageId: Nat): Text {
    channelId # ":" # Nat.toText(messageId);
  };

  public func memberKey(channelId: Text, principal: Principal): Text {
    channelId # ":" # Principal.toText(principal);
  };

  public func getMailbox(messages: MessageMap, channelId: Text): MessageMailbox {
    switch (Map.get(messages, Text.compare, channelId)) {
      case (?box) box;
      case (null) {
        let box = { var nextId = 0; var msgs = [] : [Types.CommunityMessage] };
        Map.add(messages, Text.compare, channelId, box);
        box;
      };
    };
  };
};
