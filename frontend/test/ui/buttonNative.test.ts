function resolveNativeButton(render: unknown, nativeButton?: boolean) {
  return nativeButton ?? render == null
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(resolveNativeButton(undefined) === true, "plain button stays native")
assert(resolveNativeButton({}) === false, "render slot is not a native button")
assert(resolveNativeButton({}, true) === true, "explicit nativeButton wins")
assert(resolveNativeButton(undefined, false) === false, "can disable native button")

console.log("button nativeButton ok")
