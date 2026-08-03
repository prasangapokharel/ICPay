// Written to stderr, never stdout. `npm run ci backend:hash` is meant to be
// pipeable into the rollback command, and a hash with art glued to the front is
// not a hash. String.raw so the backslashes survive unescaped.
const ART = String.raw`
                  ___           ___         ___
    ___          /  /\         /  /\       /  /\          ___
   /  /\        /  /:/        /  /::\     /  /::\        /__/|
  /  /:/       /  /:/        /  /:/\:\   /  /:/\:\      |  |:|
 /__/::\      /  /:/  ___   /  /:/~/:/  /  /:/~/::\     |  |:|
 \__\/\:\__  /__/:/  /  /\ /__/:/ /:/  /__/:/ /:/\:\  __|__|:|
    \  \:\/\ \  \:\ /  /:/ \  \:\/:/   \  \:\/:/__\/ /__/::::\
     \__\::/  \  \:\  /:/   \  \::/     \  \::/         ~\~~\:\
     /__/:/    \  \:\/:/     \  \:\      \  \:\           \  \:\
     \__\/      \  \::/       \  \:\      \  \:\           \__\/
                 \__\/         \__\/       \__\/
`

export function banner(subtitle: string): void {
  const tty = process.stderr.isTTY
  const cyan = tty ? "\x1b[36m" : ""
  const dim = tty ? "\x1b[2m" : ""
  const off = tty ? "\x1b[0m" : ""
  process.stderr.write(`${cyan}${ART}${off}${dim}  ${subtitle}${off}\n\n`)
}
