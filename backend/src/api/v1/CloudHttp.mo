import Blob "mo:core/Blob";
import HttpTypes "../../http/Types";
import CloudHttpService "../../services/CloudHttpService";
import BucketService "../../services/BucketService";

mixin (buckets: BucketService.BucketService) {

  public shared query func http_request(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (request.method) {
      case ("OPTIONS") { CloudHttpService.handleOptions() };
      case ("GET") { handleGet(request) };
      case ("HEAD") { handleHead(request) };
      case (_) { CloudHttpService.emptyResponse(405) };
    }
  };

  public shared query func http_request_streaming_callback(
    token: HttpTypes.StreamToken,
  ) : async HttpTypes.StreamingCallbackHttpResponse {
    CloudHttpService.streamingCallback(buckets, token)
  };

  func handleGet(request: HttpTypes.HttpRequest) : HttpTypes.HttpResponse {
    switch (parseAndServe(request.url)) {
      case (#err(resp)) resp;
      case (#ok(resp)) resp;
    }
  };

  func handleHead(request: HttpTypes.HttpRequest) : HttpTypes.HttpResponse {
    switch (parseAndServe(request.url)) {
      case (#err(resp)) { stripBody(resp) };
      case (#ok(resp)) { stripBody(resp) };
    }
  };

  func parseAndServe(url: Text) : { #err: HttpTypes.HttpResponse; #ok: HttpTypes.HttpResponse } {
    let path = CloudHttpService.stripQuery(url);
    switch (CloudHttpService.parseCloudPath(path)) {
      case (null) { #err(CloudHttpService.textResponse(404, "text/plain", "Not found")) };
      case (?parsed) {
        switch (CloudHttpService.prepareServe(buckets, parsed.bucketSegment, parsed.path)) {
          case (#err(resp)) { #err(resp) };
          case (#ok(#Direct({ contentType; data }))) {
            #ok(CloudHttpService.buildDirectResponse(contentType, data))
          };
          case (#ok(#Stream({ contentType; bucketId; path; data }))) {
            #ok(
              CloudHttpService.buildStreamResponse(
                contentType,
                bucketId,
                path,
                data,
                http_request_streaming_callback,
              )
            )
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
