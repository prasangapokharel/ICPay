import Blob "mo:core/Blob";
import HttpTypes "../../http/Types";
import CloudHttpService "../../services/CloudHttpService";
import BucketService "../../services/BucketService";
import BucketRepository "../../repositories/BucketRepository";

mixin (buckets: BucketService.BucketService) {

  public shared composite query func http_request(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (request.method) {
      case ("OPTIONS") { CloudHttpService.handleOptions() };
      case ("GET") { await httpGet(request) };
      case ("HEAD") { await httpHead(request) };
      case (_) { CloudHttpService.emptyResponse(405) };
    }
  };

  public shared composite query func http_request_streaming_callback(
    token: HttpTypes.StreamToken,
  ) : async HttpTypes.StreamingCallbackHttpResponse {
    let file = switch (BucketRepository.getFileByPath(buckets.store, token.bucketId, token.path)) {
      case (null) { return { body = Blob.fromArray([]); token = null } };
      case (?f) f;
    };
    let stored = switch (buckets.remoteBlobActor) {
      case (?remote) await remote.fetchBlob(file.id);
      case null null;
    };
    switch (stored) {
      case (null) { { body = Blob.fromArray([]); token = null } };
      case (?data) { CloudHttpService.streamingCallbackFromStored(buckets, token, data) };
    }
  };

  public shared composite query func httpGet(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (await buildHttpResponse(request.url)) {
      case (#err(resp)) resp;
      case (#ok(resp)) resp;
    }
  };

  public shared composite query func httpHead(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (await buildHttpResponse(request.url)) {
      case (#err(resp)) { stripBody(resp) };
      case (#ok(resp)) { stripBody(resp) };
    }
  };

  public shared composite query func buildHttpResponse(url: Text) : async {
    #err: HttpTypes.HttpResponse;
    #ok: HttpTypes.HttpResponse;
  } {
    let path = CloudHttpService.stripQuery(url);
    switch (CloudHttpService.parseCloudPath(path)) {
      case (null) { #err(CloudHttpService.textResponse(404, "text/plain", "Not found")) };
      case (?parsed) {
        let bucketId = switch (BucketService.resolveBucketId(buckets, parsed.bucketSegment)) {
          case (null) {
            return #err(CloudHttpService.textResponse(404, "text/plain", "Bucket not found"))
          };
          case (?id) id;
        };
        let file = switch (BucketRepository.getFileByPath(buckets.store, bucketId, parsed.path)) {
          case (null) {
            return #err(CloudHttpService.textResponse(404, "text/plain", "File not found"))
          };
          case (?f) f;
        };
        let stored = switch (buckets.remoteBlobActor) {
      case (?remote) await remote.fetchBlob(file.id);
      case null null;
    };
        switch (stored) {
          case (null) {
            #err(CloudHttpService.textResponse(404, "text/plain", "File not found"))
          };
          case (?data) {
            switch (
              CloudHttpService.prepareServeFromStored(buckets, parsed.bucketSegment, parsed.path, data)
            ) {
              case (#err(resp)) { #err(resp) };
              case (#ok(#Direct({ contentType; data = body }))) {
                #ok(CloudHttpService.buildDirectResponse(contentType, body))
              };
              case (#ok(#Stream({ contentType; bucketId = id; path = filePath; firstChunk; totalSize }))) {
                #ok(
                  CloudHttpService.buildStreamResponse(
                    contentType,
                    id,
                    filePath,
                    firstChunk,
                    totalSize,
                    http_request_streaming_callback,
                  )
                )
              };
            }
          };
        }
      };
    }
  };

  func stripBody(response: HttpTypes.HttpResponse) : HttpTypes.HttpResponse {
    {
      status_code = response.status_code;
      headers = response.headers;
      body = Blob.fromArray([]);
      streaming_strategy = null;
    }
  };

};
