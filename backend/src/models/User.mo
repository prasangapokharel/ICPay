import Types "../types";

module {
  public func new(id: Types.UserId, principal: Principal, username: ?Types.Username, displayName: Text, now: Int): Types.User {
    { id; principal; var username; var displayName; createdAt = now; var updatedAt = now };
  };

  public func updateDisplayName(self: Types.User, name: Text, now: Int) {
    self.displayName := name;
    self.updatedAt := now;
  };

  public func setUsername(self: Types.User, name: Types.Username, now: Int) {
    self.username := ?name;
    self.updatedAt := now;
  };

  public func clearUsername(self: Types.User, now: Int) {
    self.username := null;
    self.updatedAt := now;
  };
};
