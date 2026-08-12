module {
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method: Text;
    url: Text;
    headers: [HeaderField];
    body: Blob;
  };

  public type StreamToken = {
    bucketId: Text;
    path: Text;
    offset: Nat;
  };

  public type StreamingCallbackHttpResponse = {
    body: Blob;
    token: ?StreamToken;
  };

  public type StreamingStrategy = {
    #Callback: {
      callback: shared query StreamToken -> async StreamingCallbackHttpResponse;
      token: StreamToken;
    };
  };

  public type HttpResponse = {
    status_code: Nat16;
    headers: [HeaderField];
    body: Blob;
    streaming_strategy: ?StreamingStrategy;
  };
};
