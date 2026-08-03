import { BACKEND, run, step } from "../lib.ts"

step("BACKEND TESTS")
run("bash", ["scripts/run-tests.sh"], BACKEND)
