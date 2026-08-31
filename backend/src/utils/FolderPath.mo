import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import FilePath "FilePath";

module {
  func trimParts(path: Text) : [Text] {
    Iter.toArray(Iter.filter(Text.split(path, #char '/'), func(s) { s.size() > 0 }))
  };

  public func normalizeFolderPath(path: Text) : Text {
    let parts = trimParts(path);
    if (parts.size() == 0) {
      "/"
    } else {
      "/" # Text.join(parts.vals(), "/") # "/"
    }
  };

  func relativeParts(objectPath: Text, prefix: Text) : ?[Text] {
    let pathParts = trimParts(objectPath);
    let prefParts = trimParts(prefix);
    var i = 0;
    while (i < prefParts.size()) {
      if (i >= pathParts.size() or pathParts[i] != prefParts[i]) { return null };
      i += 1;
    };
    if (pathParts.size() < i) { return null };
    ?Array.tabulate<Text>(pathParts.size() - i, func(j) { pathParts[i + j] })
  };

  func addName(names: Map.Map<Text, ()>, name: Text) {
    if (name.size() > 0) { names.add(name, ()) };
  };

  public func childFolderNames(
    filePaths: [Text],
    storedFolderPaths: [Text],
    prefix: Text,
  ) : [Text] {
    let names = Map.empty<Text, ()>();

    for (path in filePaths.vals()) {
      switch (relativeParts(path, prefix)) {
        case (null) {};
        case (?rel) {
          if (rel.size() > 1) { addName(names, rel[0]) };
        };
      };
    };

    for (folderPath in storedFolderPaths.vals()) {
      switch (relativeParts(normalizeFolderPath(folderPath), prefix)) {
        case (null) {};
        case (?rel) {
          if (rel.size() >= 1) { addName(names, rel[0]) };
        };
      };
    };

    let sorted = Iter.toArray(Map.keys(names));
    Array.sort<Text>(sorted, Text.compare)
  };

  public func folderCoversFile(folderPath: Text, filePath: Text) : Bool {
    let folderParts = trimParts(normalizeFolderPath(folderPath));
    let fileParts = trimParts(filePath);
    if (fileParts.size() < folderParts.size()) { return false };
    var i = 0;
    while (i < folderParts.size()) {
      if (fileParts[i] != folderParts[i]) { return false };
      i += 1;
    };
    true
  };

  public func validateFolderPath(path: Text) : ?Text {
    if (path.size() == 0) { return ?("Path is required") };
    if (not Text.startsWith(path, #text "/")) { return ?("Path must start with /") };
    if (Text.contains(path, #text "..")) { return ?("Path may not contain ..") };
    let parts = trimParts(path);
    if (parts.size() == 0) { return ?("Cannot create root folder") };
    for (segment in parts.vals()) {
      if (segment.size() == 0) { return ?("Path may not contain empty segments") };
      if (segment.size() > 48) { return ?("Folder name too long") };
      for (c in segment.chars()) {
        let ok = (c >= 'a' and c <= 'z')
          or (c >= '0' and c <= '9')
          or c == '-' or c == '_';
        if (not ok) {
          return ?("Folder names may only contain lowercase letters, digits, hyphens, and underscores");
        };
      };
    };
    null
  };
};
