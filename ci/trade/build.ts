import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { BACKEND, run, step } from "../lib.ts"

const tradeDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/trade")

step("TRADE BUILD")
run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], tradeDir)
