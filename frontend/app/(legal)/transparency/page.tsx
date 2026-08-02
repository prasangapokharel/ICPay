import type { Metadata } from "next"
import Link from "next/link"
import { Section, Row, Bullets } from "@/components/legal/prose"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Transparency",
  description:
    "The ICPay canister ID, its controller, how funds are custodied, and what the operator can and cannot do — with instructions to verify each claim yourself.",
  alternates: { canonical: "/transparency" },
}

const CANISTER_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"
const FRONTEND_CANISTER_ID = "63dke-waaaa-aaaan-q6mvq-cai"
const CONTROLLER = "or2yr-zj6k5-5gi2u-qo3tj-5pyn6-lbgwr-gqgpq-ubmff-ih4t4-yopxz-lqe"
const TREASURY = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe"
const ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai"
const REPO = "https://github.com/prasangapokharel/ICPay"

export default function TransparencyPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Transparency</h1>
        <p className="text-xs text-muted-foreground">Last updated 2 August 2026</p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        A wallet asking you to trust it should hand you the means to check
        instead. Every address below is live, the source is public, and the
        limits on what the operator can do are written where you can read them.
      </p>

      <Section title="Addresses">
        <div className="rounded-xl border px-3.5 py-1">
          <Row label="ICPay canister" value={CANISTER_ID} />
          <Row label="Frontend asset canister" value={FRONTEND_CANISTER_ID} />
          <Row label="Controller (can upgrade the canister)" value={CONTROLLER} />
          <Row label="Username treasury (receives handle purchases)" value={TREASURY} />
          <Row label="ICP ledger" value={ICP_LEDGER} />
        </div>
        <p>
          Open the canister on the{" "}
          <a
            href={`https://dashboard.internetcomputer.org/canister/${CANISTER_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            ICP Dashboard
          </a>{" "}
          to see its current module hash, controller list and cycle balance
          straight from the network — not from this page.
        </p>
      </Section>

      <Section title="How your funds are held">
        <p>
          ICPay is custodial. Your ICP does not sit at your own principal; it
          sits in a subaccount of the ICPay canister, and that subaccount is
          derived deterministically from your principal.
        </p>
        <p>
          Nothing is pooled or commingled at the accounting layer: your
          subaccount address is a pure function of your identity, so your balance
          is separately addressable and independently readable on the public
          ledger. You can look it up without asking ICPay anything.
        </p>
        <p>
          The trade-off is honest and worth stating plainly: because the canister
          owns the account, the canister&apos;s code is what authorises a spend.
          That is the price of paying a username instead of a 63-character
          address.
        </p>
      </Section>

      <Section title="What the operator cannot do">
        <p>
          These are not promises; they are consequences of the interface the
          canister exposes, which you can read in the source.
        </p>
        <Bullets
          items={[
            "Move your funds. Every transfer and withdrawal derives its source account from the caller's own principal. There is no parameter for a source account, so no call can be constructed that spends from someone else's balance.",
            "Transfer on your behalf. No admin, owner or operator endpoint exists for it.",
            "Reverse or seize a transfer. Once the ledger confirms, nothing in the interface can undo it.",
            "Read your Internet Identity key. ICPay never receives one.",
            "Delete your records. No erase endpoint exists, for the operator or anyone else.",
          ]}
        />
        <p>
          The entire administrative surface is two functions: reserving and
          releasing a username, so handles matching well-known brands can be held
          back. Neither touches money.
        </p>
      </Section>

      <Section title="What the controller can do">
        <p>
          Overstating decentralisation is how trust pages mislead. So: ICPay is
          controlled by a single principal, listed above. It is not under an SNS
          or a DAO, and it is not blackholed.
        </p>
        <Bullets
          items={[
            "Upgrade the canister to different code — including code that behaves differently from what is described here.",
            "Stop the canister, making the app unavailable until it is started again.",
            "Read the canister's stored state.",
          ]}
        />
        <Alert>
          <AlertDescription className="text-sm leading-relaxed">
            This is the real risk to weigh. The current code cannot move your
            funds, but upgrade power means that guarantee holds only as long as
            the current code is deployed. Hold here accordingly.
          </AlertDescription>
        </Alert>
      </Section>

      <Section title="On-chain and not on-chain">
        <p>
          The backend is fully on-chain: accounts, usernames, balances and
          history live in the canister&apos;s stable memory on the Internet
          Computer, with no external database and no server holding user data.
        </p>
        <p>
          This interface is published to an asset canister as well, listed
          above, so it can be served entirely from the Internet Computer at{" "}
          <a
            href={`https://${FRONTEND_CANISTER_ID}.icp0.io`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {FRONTEND_CANISTER_ID}.icp0.io
          </a>
          . The same build is also hosted on Vercel, which is what most visitors
          reach; loading it there exposes your IP address to a conventional host
          even though every action still goes to the chain.
        </p>
        <p>
          The on-chain copy is the one to prefer if you want the whole path
          verifiable, and it may lag the Vercel copy between deployments. Either
          way, a frontend can only misrepresent — it cannot move funds — which is
          why the addresses above are worth checking against the dashboard
          rather than trusted from this page.
        </p>
      </Section>

      <Section title="Verify it yourself">
        <Bullets
          items={[
            <>
              Read the source at{" "}
              <a
                href={REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                github.com/prasangapokharel/ICPay
              </a>
              . The fund-moving logic is in the backend&apos;s transfer and
              withdraw services.
            </>,
            <>
              Inspect the live canister with{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                dfx canister --network ic info {CANISTER_ID}
              </code>{" "}
              to read its controller and module hash directly from the network.
            </>,
            "Query your own deposit address from the app, then look it up on the ICP Dashboard to confirm the balance the app shows you matches the ledger.",
            "Follow the block link on any receipt to see the transaction on the public ledger, independent of ICPay.",
          ]}
        />
      </Section>

      <Section title="Security reports">
        <p>
          Report vulnerabilities at{" "}
          <a
            href={`${REPO}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub issues
          </a>
          . There is no bug bounty and no private disclosure channel — if a
          finding would put user funds at immediate risk, please consider that an
          issue is public before you file.
        </p>
        <p>
          ICPay has not been formally audited. Nobody independent has reviewed
          this code for security.
        </p>
      </Section>

      <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        See also the{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
