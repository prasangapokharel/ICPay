import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";

// Adds `channelAvatar: ?Blob` to CommunityChannel.
//
// APPLIED on mainnet — do NOT re-wire into main.mo. The live canister already
// has channelAvatar on CommunityChannel. Re-attaching this migration makes moc
// reject the upgrade (M0170).
module {
  public type OldCommunityChannel = {
    id: Text;
    name: Text;
    slug: Text;
    owner: Principal;
    bio: Text;
    visibility: Types.CommunityVisibility;
    access: Types.CommunityAccess;
    priceE8s: Nat;
    inviteHash: ?Text;
    pinnedMessageId: ?Nat;
    memberCount: Nat;
    createdAt: Int;
  };

  public func migration(
    old: { communityChannels: Map.Map<Text, OldCommunityChannel> }
  ): { communityChannels: Map.Map<Text, Types.CommunityChannel> } {
    let out = Map.empty<Text, Types.CommunityChannel>();
    for ((id, ch) in old.communityChannels.entries()) {
      out.add(id, {
        id = ch.id;
        name = ch.name;
        slug = ch.slug;
        owner = ch.owner;
        bio = ch.bio;
        visibility = ch.visibility;
        access = ch.access;
        priceE8s = ch.priceE8s;
        inviteHash = ch.inviteHash;
        pinnedMessageId = ch.pinnedMessageId;
        memberCount = ch.memberCount;
        createdAt = ch.createdAt;
        channelAvatar = null;
      });
    };
    { communityChannels = out }
  };
};
