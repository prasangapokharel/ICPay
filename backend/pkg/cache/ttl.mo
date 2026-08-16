import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  public type Entry<V> = {
    value: V;
    expiresAt: Int;
  };

  public type Store<V> = Map.Map<Text, Entry<V>>;

  public func empty<V>() : Store<V> {
    Map.empty<Text, Entry<V>>()
  };

  public func put<V>(store: Store<V>, key: Text, value: V, ttlNanos: Int, now: Int) {
    store.add(key, { value; expiresAt = now + ttlNanos })
  };

  public func get<V>(store: Store<V>, key: Text, now: Int) : ?V {
    switch (store.get(key)) {
      case (null) null;
      case (?entry) {
        if (now >= entry.expiresAt) {
          store.remove(key);
          null
        } else {
          ?entry.value
        }
      };
    }
  };

  public func remove<V>(store: Store<V>, key: Text) {
    store.remove(key)
  };

  public func filterAlive<V>(store: Store<V>, now: Int) : Store<V> {
    let next = Map.empty<Text, Entry<V>>();
    for ((key, entry) in store.entries()) {
      if (entry.expiresAt > now) {
        next.add(key, entry);
      };
    };
    next
  };
};
