import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import SocialLinkService "../../src/services/SocialLinkService";
import UserRepo "../../src/repositories/UserRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let svc = SocialLinkService.create(users);

let p = Principal.fromText("aaaaa-aa");
let now = Time.now();
let _ = UserRepo.create(users, usernames, usersById, "uid-1", p, null, "", now, null);

// unknown user rejected
switch (SocialLinkService.setSocialLink(svc, Principal.fromText("mk4xk-sqaaa-aaaaa-qadjq-cai"), #github, "https://github.com/test")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject unknown user") };
  case (#err(_)) { Debug.print("PASS: unknown user rejected") };
};

// invalid URL (no https)
switch (SocialLinkService.setSocialLink(svc, p, #github, "http://github.com/test")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject non-https") };
  case (#err(_)) { Debug.print("PASS: non-https rejected") };
};

// invalid github URL
switch (SocialLinkService.setSocialLink(svc, p, #github, "https://notgithub.com/test")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject non-github URL for #github") };
  case (#err(_)) { Debug.print("PASS: wrong domain for github rejected") };
};

// invalid linkedin URL
switch (SocialLinkService.setSocialLink(svc, p, #linkedin, "https://linkedin.com/pub/test")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject linkedin.com/pub/") };
  case (#err(_)) { Debug.print("PASS: wrong linkedin path rejected") };
};

// invalid website TLD
switch (SocialLinkService.setSocialLink(svc, p, #website, "https://mysite.xyz")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject .xyz TLD") };
  case (#err(_)) { Debug.print("PASS: disallowed TLD rejected") };
};

// localhost rejected
switch (SocialLinkService.setSocialLink(svc, p, #website, "https://localhost/mysite")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject localhost") };
  case (#err(_)) { Debug.print("PASS: localhost rejected") };
};

// valid github
switch (SocialLinkService.setSocialLink(svc, p, #github, "https://github.com/alice")) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 1;
    assert links[0].platform == #github;
    Debug.print("PASS: set github link");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: set github: " # e) };
};

// valid linkedin
switch (SocialLinkService.setSocialLink(svc, p, #linkedin, "https://linkedin.com/in/alice")) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 2;
    Debug.print("PASS: set linkedin link, now 2 links");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: set linkedin: " # e) };
};

// valid website
switch (SocialLinkService.setSocialLink(svc, p, #website, "https://alice.app")) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 3;
    Debug.print("PASS: set website link, now 3 links");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: set website: " # e) };
};

// upsert: replacing github keeps count at 3
switch (SocialLinkService.setSocialLink(svc, p, #github, "https://github.com/alice-new")) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 3;
    Debug.print("PASS: upsert github keeps 3 links");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: upsert: " # e) };
};

// remove linkedin
switch (SocialLinkService.removeSocialLink(svc, p, #linkedin)) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 2;
    Debug.print("PASS: remove linkedin, now 2 links");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: remove: " # e) };
};

// remove non-existent is silent (no error, just no change)
switch (SocialLinkService.removeSocialLink(svc, p, #linkedin)) {
  case (#ok(u)) {
    let links = switch (u.socialLinks) { case (?l) l; case null [] };
    assert links.size() == 2;
    Debug.print("PASS: remove already-removed is silent");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: remove non-existent: " # e) };
};

Debug.print("SocialLinkService tests done");
