import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat16 "mo:core/Nat16";
import Config "../config/Config";
import HttpTypes "../http/Types";
import BucketService "BucketService";
import ApiKeyCrypto "../utils/ApiKeyCrypto";

module {
  public type ParsedCloudPath = { bucketSegment: Text; path: Text };

  public func stripQuery(url: Text) : Text {
    switch (Text.split(url, #char '?').next()) {
      case (null) url;
      case (?head) head;
    }
  };

  // /cloud/{bucketNameOrId}/file.webp → segment + /file.webp
  public func parseCloudPath(urlPath: Text) : ?ParsedCloudPath {
    let prefix = "/cloud/";
    if (not Text.startsWith(urlPath, #text prefix)) return null;
    let rest = Text.trimStart(urlPath, #text prefix);
    if (rest.size() == 0) return null;
    switch (Text.split(rest, #char '/').next()) {
      case (null) null;
      case (?bucketSegment) {
        if (bucketSegment.size() == 0) return null;
        let pathRest = Text.trimStart(rest, #text (bucketSegment # "/"));
        let filePath = if (Text.startsWith(pathRest, #text "/")) {
          pathRest
        } else if (pathRest.size() == 0) {
          return null
        } else {
          "/" # pathRest
        };
        ?{ bucketSegment; path = filePath }
      };
    }
  };

  public func corsHeaders(contentType: Text) : [HttpTypes.HeaderField] {
    [
      ("Content-Type", contentType),
      ("Access-Control-Allow-Origin", "*"),
      ("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"),
      ("Cache-Control", "public, max-age=3600"),
    ]
  };

  public func textResponse(status: Nat16, contentType: Text, body: Text) : HttpTypes.HttpResponse {
    {
      status_code = status;
      headers = [
        ("Content-Type", contentType),
        ("Access-Control-Allow-Origin", "*"),
      ];
      body = Text.encodeUtf8(body);
      streaming_strategy = null;
    }
  };

  public func emptyResponse(status: Nat16) : HttpTypes.HttpResponse {
    {
      status_code = status;
      headers = [("Access-Control-Allow-Origin", "*")];
      body = Blob.fromArray([]);
      streaming_strategy = null;
    }
  };

  public func handleOptions() : HttpTypes.HttpResponse {
    {
      status_code = 204;
      headers = [
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"),
        ("Access-Control-Max-Age", "86400"),
      ];
      body = Blob.fromArray([]);
      streaming_strategy = null;
    }
  };

  public type ServeResult = {
    #Direct: { contentType: Text; data: Blob };
    #Stream: { contentType: Text; bucketId: Text; path: Text; firstChunk: Blob; totalSize: Nat };
  };

  public func prepareServeFromStored(
    service: BucketService.BucketService,
    bucketSegment: Text,
    path: Text,
    stored: Blob,
  ) : { #err: HttpTypes.HttpResponse; #ok: ServeResult } {
    if (ApiKeyCrypto.isValidShape(bucketSegment)) {
      return #err(
        textResponse(
          404,
          "text/plain",
          "Bucket not found — use the bucket name or id from the app, not an API key",
        )
      )
    };
    let bucketId = switch (BucketService.resolveBucketId(service, bucketSegment)) {
      case (null) {
        return #err(textResponse(404, "text/plain", "Bucket not found"))
      };
      case (?id) id;
    };
    switch (
      BucketService.servePublicFileChunkFromStored(service, bucketId, path, 0, Config.HTTP_MAX_BODY_BYTES, stored)
    ) {
      case (#err("Bucket not found")) { #err(textResponse(404, "text/plain", "Bucket not found")) };
      case (#err("File not found")) { #err(textResponse(404, "text/plain", "File not found")) };
      case (#err("Bucket is private")) { #err(textResponse(403, "text/plain", "Forbidden")) };
      case (#err(_)) { #err(textResponse(500, "text/plain", "Error")) };
      case (#ok({ contentType; chunk; totalSize })) {
        if (totalSize <= Config.HTTP_MAX_BODY_BYTES) {
          if (chunk.size() == totalSize) {
            #ok(#Direct({ contentType; data = chunk }))
          } else {
            switch (BucketService.servePublicFileChunkFromStored(service, bucketId, path, 0, totalSize, stored)) {
              case (#err(_)) { #err(textResponse(500, "text/plain", "Error")) };
              case (#ok({ contentType = ct; chunk = data; totalSize = _ })) {
                #ok(#Direct({ contentType = ct; data }))
              };
            }
          }
        } else {
          #ok(#Stream({ contentType; bucketId; path; firstChunk = chunk; totalSize }))
        }
      };
    }
  };

  public func prepareServe(
    service: BucketService.BucketService,
    bucketSegment: Text,
    path: Text,
  ) : async { #err: HttpTypes.HttpResponse; #ok: ServeResult } {
    if (ApiKeyCrypto.isValidShape(bucketSegment)) {
      return #err(
        textResponse(
          404,
          "text/plain",
          "Bucket not found — use the bucket name or id from the app, not an API key",
        )
      )
    };
    let bucketId = switch (BucketService.resolveBucketId(service, bucketSegment)) {
      case (null) {
        return #err(textResponse(404, "text/plain", "Bucket not found"))
      };
      case (?id) id;
    };
    // Never full-decrypt in http_request — query instruction limit traps on ~700KB+.
    // Slice decrypt matches streaming and stays within the IC query budget.
    switch (
      await BucketService.servePublicFileChunk(service, bucketId, path, 0, Config.HTTP_MAX_BODY_BYTES)
    ) {
      case (#err("Bucket not found")) { #err(textResponse(404, "text/plain", "Bucket not found")) };
      case (#err("File not found")) { #err(textResponse(404, "text/plain", "File not found")) };
      case (#err("Bucket is private")) { #err(textResponse(403, "text/plain", "Forbidden")) };
      case (#err(_)) { #err(textResponse(500, "text/plain", "Error")) };
      case (#ok({ contentType; chunk; totalSize })) {
        if (totalSize <= Config.HTTP_MAX_BODY_BYTES) {
          if (chunk.size() == totalSize) {
            #ok(#Direct({ contentType; data = chunk }))
          } else {
            switch (await BucketService.servePublicFileChunk(service, bucketId, path, 0, totalSize)) {
              case (#err(_)) { #err(textResponse(500, "text/plain", "Error")) };
              case (#ok({ contentType = ct; chunk = data; totalSize = _ })) {
                #ok(#Direct({ contentType = ct; data }))
              };
            }
          }
        } else {
          #ok(#Stream({ contentType; bucketId; path; firstChunk = chunk; totalSize }))
        }
      };
    }
  };

  public func buildDirectResponse(contentType: Text, data: Blob) : HttpTypes.HttpResponse {
    {
      status_code = 200;
      headers = corsHeaders(contentType);
      body = data;
      streaming_strategy = null;
    }
  };

  public func buildStreamResponse(
    contentType: Text,
    bucketId: Text,
    path: Text,
    firstChunk: Blob,
    totalSize: Nat,
    callback: shared composite query HttpTypes.StreamToken -> async HttpTypes.StreamingCallbackHttpResponse,
  ) : HttpTypes.HttpResponse {
    let nextOffset = firstChunk.size();
    {
      status_code = 200;
      headers = corsHeaders(contentType);
      body = firstChunk;
      streaming_strategy = if (nextOffset >= totalSize) {
        null
      } else {
        ?#Callback({
          token = { bucketId; path; offset = nextOffset };
          callback = callback;
        })
      };
    }
  };

  public func streamingCallbackFromStored(
    service: BucketService.BucketService,
    token: HttpTypes.StreamToken,
    stored: Blob,
  ) : HttpTypes.StreamingCallbackHttpResponse {
    switch (
      BucketService.servePublicFileChunkFromStored(
        service,
        token.bucketId,
        token.path,
        token.offset,
        Config.HTTP_CHUNK_BYTES,
        stored,
      )
    ) {
      case (#err(_)) {
        { body = Blob.fromArray([]); token = null }
      };
      case (#ok({ chunk; totalSize })) {
        let next = token.offset + chunk.size();
        {
          body = chunk;
          token = if (next >= totalSize) { null } else {
            ?{
              bucketId = token.bucketId;
              path = token.path;
              offset = next;
            }
          };
        }
      };
    }
  };

  public func streamingCallback(
    service: BucketService.BucketService,
    token: HttpTypes.StreamToken,
  ) : async HttpTypes.StreamingCallbackHttpResponse {
    switch (
      await BucketService.servePublicFileChunk(
        service,
        token.bucketId,
        token.path,
        token.offset,
        Config.HTTP_CHUNK_BYTES,
      )
    ) {
      case (#err(_)) {
        { body = Blob.fromArray([]); token = null }
      };
      case (#ok({ chunk; totalSize })) {
        let next = token.offset + chunk.size();
        {
          body = chunk;
          token = if (next >= totalSize) { null } else {
            ?{
              bucketId = token.bucketId;
              path = token.path;
              offset = next;
            }
          };
        }
      };
    }
  };

};
