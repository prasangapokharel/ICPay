import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Types "../../types";
import TokenWasmService "../TokenWasmService";
import Context "Context";

module {
  public func uploadWasmChunk(service: Context.TokenService, chunk: Blob): async Blob {
    await TokenWasmService.uploadChunk(service.wasm, service.self, chunk);
  };

  public func sealWasm(service: Context.TokenService, moduleHash: Blob): Types.ApiResult<()> {
    TokenWasmService.seal(service.wasm, moduleHash);
  };

  public func resetWasm(service: Context.TokenService): async () {
    await TokenWasmService.reset(service.wasm, service.self);
  };

  public func isLaunchReady(service: Context.TokenService): Bool {
    TokenWasmService.isReady(service.wasm);
  };
};
