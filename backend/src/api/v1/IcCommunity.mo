import Types "../../types";
import IcCommunityService "../../services/IcCommunityService";
import MiddlewareAuth "../../middleware/Auth";
import Nat8 "mo:core/Nat8";

mixin (community: IcCommunityService.IcCommunityService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func createCommunityChannel(
    name: Text,
    slug: Text,
    bio: Text,
    visibility: Types.CommunityVisibility,
    access: Types.CommunityAccess,
    priceE8s: Nat,
    inviteSecret: ?Text,
  ): async Types.ApiResult<Types.CommunityCreateResult> {
    IcCommunityService.createChannel(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      name,
      slug,
      bio,
      visibility,
      access,
      priceE8s,
      inviteSecret,
    );
  };

  public shared ({ caller }) func joinCommunityChannel(
    channelId: Text,
    inviteCode: ?Text,
  ): async Types.ApiResult<Types.CommunityChannelPublic> {
    await IcCommunityService.joinChannel(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      inviteCode,
    );
  };

  public shared ({ caller }) func leaveCommunityChannel(channelId: Text): async Types.ApiResult<()> {
    IcCommunityService.leaveChannel(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
    );
  };

  public shared ({ caller }) func postCommunityMessage(
    channelId: Text,
    text: Text,
  ): async Types.ApiResult<Types.CommunityMessagePublic> {
    IcCommunityService.postMessage(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      text,
    );
  };

  public shared ({ caller }) func pinCommunityMessage(
    channelId: Text,
    messageId: Nat,
  ): async Types.ApiResult<Types.CommunityChannelPublic> {
    IcCommunityService.pinMessage(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      messageId,
    );
  };

  public shared ({ caller }) func deleteCommunityMessage(
    channelId: Text,
    messageId: Nat,
  ): async Types.ApiResult<()> {
    IcCommunityService.deleteMessage(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      messageId,
    );
  };

  public shared ({ caller }) func setCommunityMessageReaction(
    channelId: Text,
    messageId: Nat,
    code: Nat8,
  ): async Types.ApiResult<Types.CommunityReactionUpdate> {
    IcCommunityService.setReaction(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      messageId,
      code,
    );
  };

  public shared query func getCommunityChannel(channelId: Text): async ?Types.CommunityChannelPublic {
    IcCommunityService.getChannel(community, channelId);
  };

  public shared query func listPublicCommunityChannels(limit: Nat, offset: Nat): async [Types.CommunityChannelPublic] {
    IcCommunityService.listPublicChannels(community, limit, offset);
  };

  public shared query ({ caller }) func listMyCommunityChannels(): async Types.ApiResult<[Types.CommunityChannelPublic]> {
    IcCommunityService.listMyChannels(community, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared query ({ caller }) func listCommunityMessages(
    channelId: Text,
    afterId: Nat,
    limit: Nat,
  ): async Types.ApiResult<[Types.CommunityMessagePublic]> {
    IcCommunityService.listMessages(
      community,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      channelId,
      afterId,
      limit,
    );
  };

  public shared query ({ caller }) func isCommunityMember(channelId: Text): async Bool {
    IcCommunityService.isMember(community, MiddlewareAuth.effectiveCaller(mwConfig, caller), channelId);
  };
};
