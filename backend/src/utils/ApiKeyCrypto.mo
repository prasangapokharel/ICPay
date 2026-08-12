import Int "mo:core/Int";
import Char "mo:core/Char";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Sha256 "Sha256";

module {
  public let PREFIX : Text = "icp_cloud_";

  public func hashSecret(secret: Text) : Text {
    Sha256.toHex(Blob.toArray(Sha256.sha256Blob(Text.encodeUtf8(secret))))
  };

  public func keyHint(secret: Text) : Text {
    if (secret.size() <= 16) return secret;
    takeChars(secret, 16) # "…"
  };

  public func generateSecret(owner: Principal, nonce: Text) : Text {
    let material = PREFIX # Principal.toText(owner) # ":" # nonce # ":" # Int.toText(Time.now());
    let digest = Sha256.toHex(Blob.toArray(Sha256.sha256Blob(Text.encodeUtf8(material))));
    PREFIX # takeChars(digest, 32)
  };

  public func isValidShape(secret: Text) : Bool {
    Text.startsWith(secret, #text PREFIX) and secret.size() >= PREFIX.size() + 8
  };

  func takeChars(t: Text, n: Nat) : Text {
    var out = "";
    var count = 0;
    label slice for (c in t.chars()) {
      if (count >= n) break slice;
      out #= Char.toText(c);
      count += 1;
    };
    out
  };
};
