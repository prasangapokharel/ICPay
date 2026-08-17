import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types";

module {
  public type RoomMap = Map.Map<Text, Types.LiveRoom>;
  public type PeerMap = Map.Map<Text, List.List<Types.LivePeer>>;
  public type SignalMailbox = {
    var nextId: Nat;
    var msgs: [Types.LiveSignal];
  };
  public type SignalMap = Map.Map<Text, SignalMailbox>;

  public let MAX_TITLE = 80;
  public let MAX_TAB_ID = 64;
  public let MAX_PAYLOAD = 4_096;
  public let MAX_SIGNALS = 64;
  public let MAX_PEERS = 6;
  public let MAX_ACTIVE_ROOMS_PER_HOST = 3;

  public func createRoomMap(): RoomMap {
    Map.empty<Text, Types.LiveRoom>();
  };

  public func createPeerMap(): PeerMap {
    Map.empty<Text, List.List<Types.LivePeer>>();
  };

  public func createSignalMap(): SignalMap {
    Map.empty<Text, SignalMailbox>();
  };

  public func clearRoomTransient(peers: PeerMap, signals: SignalMap, roomId: Text) {
    Map.remove(peers, Text.compare, roomId);
    Map.remove(signals, Text.compare, roomId);
  };

  public func getMailbox(signals: SignalMap, roomId: Text): SignalMailbox {
    switch (Map.get(signals, Text.compare, roomId)) {
      case (?box) box;
      case (null) {
        let box = { var nextId = 0; var msgs = [] : [Types.LiveSignal] };
        Map.add(signals, Text.compare, roomId, box);
        box;
      };
    };
  };
};
