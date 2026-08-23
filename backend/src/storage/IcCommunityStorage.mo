import Map "mo:core/Map";
import Nat "mo:core/Nat";
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

  public let MAX_NAME = 80;
  public let MAX_BIO = 280;
  public let MIN_SLUG = 3;
  public let MAX_SLUG = 32;
  public let MAX_MESSAGE = 2_000;
  public let MAX_MESSAGES = 2_000;
  public let MAX_LIST = 50;

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
