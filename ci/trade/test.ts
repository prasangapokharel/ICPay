import { BACKEND, run, step } from "../lib.ts"

step("TRADE TESTS")
run("bash", ["scripts/run-trade-tests.sh"], BACKEND)
