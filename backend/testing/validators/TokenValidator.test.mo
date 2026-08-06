import Debug "mo:core/Debug";
import TokenValidator "../../src/validators/TokenValidator";

func params(name: Text, symbol: Text): TokenValidator.LaunchParams {
  {
    name;
    symbol;
    description = "";
    logo = null;
    website = null;
    telegram = null;
    twitter = null;
    decimals = 8;
    totalSupply = 1_000_000;
    immutable = false;
  };
};

assert (TokenValidator.validate(params("My Token", "MTK")) == null);
Debug.print("PASS: a well-formed launch validates");

assert (TokenValidator.validate(params("", "MTK")) != null);
assert (TokenValidator.validateName("") != null);
Debug.print("PASS: empty name rejected");

// Case-folding is what stops "doge" being launched alongside "DOGE" and passing
// for it, so it is the comparison key everywhere symbols are checked.
assert (TokenValidator.normalizeSymbol("doge") == "DOGE");
assert (TokenValidator.normalizeSymbol("DoGe") == TokenValidator.normalizeSymbol("dOgE"));
Debug.print("PASS: symbols normalize case-insensitively");

assert (TokenValidator.validateSymbol("A") != null);
assert (TokenValidator.validateSymbol("TOOLONGSYM") != null);
assert (TokenValidator.validateSymbol("MTK") == null);
assert (TokenValidator.validateSymbol("mtk") == null);
assert (TokenValidator.validateSymbol("BTC2") == null);
Debug.print("PASS: symbol length bounds");

// A symbol is rendered raw next to a balance, so anything that is not
// alphanumeric is a spoofing surface.
assert (TokenValidator.validateSymbol("MT K") != null);
assert (TokenValidator.validateSymbol("MT-K") != null);
assert (TokenValidator.validateSymbol("MT.K") != null);
Debug.print("PASS: non-alphanumeric symbols rejected");

// Links render as clickable anchors on the token page. Without this check
// `javascript:` is stored XSS reachable by a direct canister call that never
// touched the form.
assert (TokenValidator.validateLink(?"javascript:alert(1)") != null);
assert (TokenValidator.validateLink(?"http://example.com") != null);
assert (TokenValidator.validateLink(?"https://example.com") == null);
assert (TokenValidator.validateLink(null) == null);
assert (TokenValidator.validateLink(?"") == null);
Debug.print("PASS: only https links accepted");

assert (TokenValidator.validateLogo(?"https://example.com/a.png") != null);
assert (TokenValidator.validateLogo(?"data:image/png;base64,AAAA") == null);
assert (TokenValidator.validateLogo(null) == null);
Debug.print("PASS: logo must be a data URI");

assert (TokenValidator.validate({ params("My Token", "MTK") with totalSupply = 0 }) != null);
assert (TokenValidator.validate({ params("My Token", "MTK") with decimals = 19 : Nat8 }) != null);
Debug.print("PASS: supply and decimals bounds");

Debug.print("ALL TOKEN VALIDATOR TESTS PASSED");
