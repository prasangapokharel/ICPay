import Types "../../types";
import LiveService "../../services/LiveService";
import MiddlewareAuth "../../middleware/Auth";

mixin (live: LiveService.LiveService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func createLiveRoom(
    title: Text,
    visibility: Types.LiveVisibility,
    inviteSecret: ?Text,
  ): async Types.ApiResult<Types.LiveCreateResult> {
    LiveService.createRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), title, visibility, inviteSecret);
  };

  public shared ({ caller }) func startLiveRoom(roomId: Text): async Types.ApiResult<Types.LiveRoomPublic> {
    LiveService.startRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId);
  };

  public shared ({ caller }) func pauseLiveRoom(roomId: Text): async Types.ApiResult<Types.LiveRoomPublic> {
    LiveService.pauseRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId);
  };

  public shared ({ caller }) func resumeLiveRoom(roomId: Text): async Types.ApiResult<Types.LiveRoomPublic> {
    LiveService.resumeRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId);
  };

  public shared ({ caller }) func endLiveRoom(roomId: Text): async Types.ApiResult<()> {
    LiveService.endRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId);
  };

  public shared ({ caller }) func joinLiveRoom(
    roomId: Text,
    tabId: Text,
    inviteToken: ?Text,
  ): async Types.ApiResult<Types.LiveRoomPublic> {
    LiveService.joinRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId, tabId, inviteToken);
  };

  public shared ({ caller }) func leaveLiveRoom(roomId: Text, tabId: Text): async Types.ApiResult<()> {
    LiveService.leaveRoom(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId, tabId);
  };

  public shared ({ caller }) func postLiveSignal(
    roomId: Text,
    tabId: Text,
    toTab: ?Text,
    payload: Text,
  ): async Types.ApiResult<Nat> {
    LiveService.postSignal(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId, tabId, toTab, payload);
  };

  public shared query ({ caller }) func pollLiveSignals(
    roomId: Text,
    tabId: Text,
    afterId: Nat,
  ): async Types.ApiResult<[Types.LiveSignal]> {
    LiveService.pollSignals(live, MiddlewareAuth.effectiveCaller(mwConfig, caller), roomId, tabId, afterId);
  };

  public shared query func getLiveRoom(roomId: Text): async ?Types.LiveRoomPublic {
    LiveService.getRoom(live, roomId);
  };

  public shared query func listPublicLiveRooms(limit: Nat, offset: Nat): async [Types.LiveRoomPublic] {
    LiveService.listPublicRooms(live, limit, offset);
  };

  public shared query func listLivePeers(roomId: Text): async [Types.LivePeerPublic] {
    LiveService.listPeers(live, roomId);
  };
};
