import { FRONTEND, run, step } from "../lib.ts"

step("TYPECHECK")
run("npm", ["run", "typecheck"], FRONTEND)

step("BUILD")
run("npm", ["run", "build"], FRONTEND)
