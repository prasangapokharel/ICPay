// Shared helpers for every ci command. Kept deliberately small: each command
// file should read as the dfx invocation it wraps, not as plumbing.
import { spawn, spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..")

export const BACKEND = resolve(repo, "backend")
export const FRONTEND = resolve(repo, "frontend")

export const CANISTER = "icp_wallet_backend"
export const ICP_INDEX = "qhbym-qaaaa-aaaaa-aaafq-cai"

// dfx refuses to touch mainnet with a plaintext identity unless this is set, and
// the controller key on this machine is plaintext.
const env = { ...process.env, DFX_WARNING: "-mainnet_plaintext_identity" }

// Every command defaults to mainnet, because that is the only network this
// project actually runs on. --local is here for a replica session.
export const network = (): string => (process.argv.includes("--local") ? "local" : "ic")

const positional = (): string[] => process.argv.slice(3).filter((a) => !a.startsWith("--"))

export const arg = (i: number): string | undefined => positional()[i]

export function requireArg(i: number, usage: string): string {
  const value = positional()[i]
  if (!value) {
    console.error(`Usage: ${usage}`)
    process.exit(1)
  }
  return value
}

export function step(title: string): void {
  console.log(`\n=== ${title} ===`)
}

// Streams output rather than buffering: a deploy that hangs should show where.
export function run(cmd: string, args: string[], cwd: string = BACKEND): void {
  const res = spawnSync(cmd, args, { cwd, env, stdio: "inherit" })
  if (res.status !== 0) {
    console.error(`\nFAILED: ${cmd} ${args.join(" ")}`)
    process.exit(res.status ?? 1)
  }
}

export function capture(cmd: string, args: string[], cwd: string = BACKEND): string {
  const res = spawnSync(cmd, args, { cwd, env, encoding: "utf8" })
  if (res.status !== 0) {
    console.error(res.stderr?.trim() || `FAILED: ${cmd} ${args.join(" ")}`)
    process.exit(res.status ?? 1)
  }
  return res.stdout?.trim() ?? ""
}

export const dfx = (args: string[], cwd?: string): void =>
  run("dfx", [...args, "--network", network()], cwd)

export const dfxOut = (args: string[], cwd?: string): string =>
  capture("dfx", [...args, "--network", network()], cwd)

// A round trip to a mainnet boundary node is ~7s regardless of how trivial the
// method is, so a command making tens of calls has to overlap them or it takes
// minutes. Only safe for queries: they are not billed and cannot mutate state.
export function dfxOutMany(argSets: string[][], cwd?: string): Promise<string[]> {
  const net = network()
  return Promise.all(
    argSets.map(
      (args) =>
        new Promise<string>((done) => {
          const child = spawn("dfx", [...args, "--network", net], { cwd: cwd ?? BACKEND, env })
          let stdout = ""
          child.stdout.on("data", (chunk) => (stdout += chunk))
          child.on("close", () => done(stdout))
        }),
    ),
  )
}

export function moduleHash(canister: string = CANISTER): string {
  return dfxOut(["canister", "info", canister]).match(/Module hash: (0x[0-9a-f]+)/)?.[1] ?? "unknown"
}

// A mainnet write is irreversible and this canister custodies real ICP, so every
// one of them stops here first. CI never reaches this: it has no TTY, and the
// workflow runs no deploy commands at all.
export function confirm(action: string): void {
  if (network() === "local") return
  if (!process.stdin.isTTY) {
    console.error(`Refusing to ${action} without an interactive terminal.`)
    process.exit(1)
  }
  // Reads and prompts through /dev/tty rather than stdin, because capture()
  // spawns with piped stdio: `read` would hit EOF immediately, return empty and
  // abort every deploy. stderr is redirected too -- `read -p` writes its prompt
  // there, so without it the prompt is captured and the process waits silently
  // on what looks like a hang. Only the answer goes to stdout, to be captured.
  const answer = capture("bash", [
    "-c",
    `read -r -p "About to ${action}. Type yes: " a < /dev/tty 2> /dev/tty; echo "$a"`,
  ])
  if (answer !== "yes") {
    console.log("Aborted.")
    process.exit(1)
  }
}
