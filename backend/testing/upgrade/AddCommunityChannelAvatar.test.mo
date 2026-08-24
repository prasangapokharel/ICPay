import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AddCommunityChannelAvatar "../../src/migrations/AddCommunityChannelAvatar";
import Fixtures "../bucket/Fixtures";

let owner = Principal.fromText("aaaaa-aa");
let now = Time.now();

let oldChannel : AddCommunityChannelAvatar.OldCommunityChannel = {
  id = "alpha";
  name = "Alpha";
  slug = "alpha";
  owner = owner;
  bio = "bio";
  visibility = #open;
  access = #free;
  priceE8s = 0;
  inviteHash = null;
  pinnedMessageId = null;
  memberCount = 1;
  createdAt = now;
};

let oldMap = Map.empty<Text, AddCommunityChannelAvatar.OldCommunityChannel>();
Map.add(oldMap, Text.compare, "alpha", oldChannel);

let result = AddCommunityChannelAvatar.migration({ communityChannels = oldMap });

switch (Map.get(result.communityChannels, Text.compare, "alpha")) {
  case (null) { assert false; Debug.print("FAIL: migrated channel missing") };
  case (?ch) {
    assert ch.channelAvatar == null;
    assert ch.slug == "alpha";
    Debug.print("PASS: CommunityChannel migration adds null channelAvatar");
  };
};

Debug.print("AddCommunityChannelAvatar tests done");
