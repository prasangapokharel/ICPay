/** Limit UI updates during chunked uploads — avoids main-thread stalls. */
export function shouldEmitUploadProgress(prev: number, next: number): boolean {
  if (next >= 100) return true
  if (next <= 0) return true
  return next - prev >= 4
}
