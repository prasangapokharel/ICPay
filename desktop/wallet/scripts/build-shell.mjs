import { copyFileSync, mkdirSync } from "node:fs"

mkdirSync("dist", { recursive: true })
copyFileSync("shell/index.html", "dist/index.html")
