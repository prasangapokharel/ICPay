import Types "../types";

module {
  public func new(userId: Types.UserId, now: Int): Types.Settings {
    { userId; var theme = "light"; var language = "en"; var notifications = true; var updatedAt = now };
  };

  public func update(self: Types.Settings, theme: Text, language: Text, notifications: Bool, now: Int) {
    self.theme := theme;
    self.language := language;
    self.notifications := notifications;
    self.updatedAt := now;
  };
};
