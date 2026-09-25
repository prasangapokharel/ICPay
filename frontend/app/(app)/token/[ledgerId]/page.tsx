import { TokenView } from "./token-view"
import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"
import { CKBTC_LEDGER_ID, CKETH_LEDGER_ID } from "@/services/chainkey/constants"

export function generateStaticParams() {
  return [
    { ledgerId: "token" },
    { ledgerId: ICP_LEDGER_ID },
    { ledgerId: ICPAY_LEDGER_ID },
    { ledgerId: CKBTC_LEDGER_ID },
    { ledgerId: CKETH_LEDGER_ID },
  ]
}

export default function TokenPage() {
  return <TokenView />
}
