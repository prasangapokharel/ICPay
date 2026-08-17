import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICPay Swap & Live: Trade Tokens and Voice Rooms on the Internet Computer",
  description:
    "ICPay Swap lets you exchange ICP and ICRC tokens in-wallet via ICPSwap. ICPay Live adds on-chain voice rooms with peer-to-peer audio. Here is how both work.",
  alternates: { canonical: "/blog/icpay-swap-and-live" },
  openGraph: {
    title: "ICPay Swap & Live — ICPay Blog",
    description:
      "Swap tokens and join voice rooms — two new ICPay features built on the Internet Computer.",
    type: "article",
    publishedTime: "2026-08-17T00:00:00Z",
  },
}

export default function IcpaySwapAndLivePage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Product</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ICPay Swap &amp; Live: Two New Ways to Use Your Wallet
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ICPay started as a simple ICP wallet — send, receive, hold. Swap and Live extend that
          into token trading and real-time voice, without leaving the app or handing custody to
          another service.
        </p>
        <p className="text-[11px] text-muted-foreground">August 17, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICPay Swap</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Swap</strong> exchanges one token for another inside
          your ICPay balance. Pick a token you hold, pick what you want, enter an amount, and
          confirm. Quotes come from{" "}
          <a
            href="https://icpswap.com"
            className="underline underline-offset-2 hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            ICPSwap
          </a>{" "}
          — the largest decentralised exchange on the Internet Computer — and execution settles
          through the same custodial subaccount model ICPay already uses for sends and deposits.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Supported tokens</strong> — ICP plus ICRC-1 and
            ICRC-2 tokens in your wallet. ICPAY itself is excluded from swapping.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Live quotes</strong> — rates refresh as you type;
            you see expected output, pool fee, and ICPay service fee before confirming.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">One tap from the dashboard</strong> — Send, Swap,
            and Receive sit on the home screen; Swap is also in the menu under Money.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Swaps are on-chain ledger operations routed through ICPSwap pools. ICPay does not hold
          your keys — you authorise each swap with Internet Identity, the same way you authorise a
          transfer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to swap</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">Open ICPay and sign in with Internet Identity.</li>
          <li className="list-decimal">Tap <strong className="text-foreground">Swap</strong> on the dashboard or menu.</li>
          <li className="list-decimal">Choose the token you are selling and the token you want.</li>
          <li className="list-decimal">Enter an amount and review the quote.</li>
          <li className="list-decimal">Confirm — balances update after the swap completes on-chain.</li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If a swap fails mid-execution but funds were already moved, ICPay shows a recovery path
          so you can finish or unwind the trade instead of leaving tokens stuck.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICPay Live</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Live</strong> is voice chat for the Internet
          Computer — think of it as lightweight audio rooms tied to your ICPay identity. Host a
          hangout, a weekly sync, or an AMA. Guests join from a link, hear speakers immediately,
          and turn the mic on only when they want to talk.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The design splits work cleanly: <strong className="text-foreground">signaling stays
          on-chain</strong> (who is in the room, WebRTC offers, answers, ICE candidates) while{" "}
          <strong className="text-foreground">audio stays peer-to-peer</strong> between browsers.
          That keeps voice off the canister and cycle costs low — queries are free, and only room
          join/leave and signal posts cost cycles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Inside a live room</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Auto-listen</strong> — you hear others as soon as
            audio connects. No need to enable your mic first.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Participant grid</strong> — avatars and @usernames
            in a compact layout. Premium handles show a verified badge.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Host controls</strong> — start, pause, resume, or
            end the room. Public rooms appear in the live list; private rooms need an invite link.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Premium hosting</strong> — creating a room
            requires a premium or ultra-premium username (1–4 characters). Anyone can join.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to join or host</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            Go to <strong className="text-foreground">Live</strong> in the ICPay menu.
          </li>
          <li className="list-decimal">
            Browse public rooms and tap <strong className="text-foreground">Join</strong>, or open
            a private invite link.
          </li>
          <li className="list-decimal">
            Wait for the host to start the room if it is still in draft.
          </li>
          <li className="list-decimal">
            Listen automatically; tap the mic button when you want to speak.
          </li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Premium handle holders can tap <strong className="text-foreground">New room</strong>,
          set a title and visibility, then start when ready.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why both features fit ICP</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Swap and Live are not bolted-on web2 services. Swap routes through ICPSwap canisters on
          the IC; Live stores room state and signaling in the same wallet canister that already
          holds your balance. Your Internet Identity principal is your identity in both — no extra
          accounts, no separate login.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That is the point of building on the Internet Computer: wallet, exchange, storage, and
          now voice — one chain, one auth model, auditable on-chain logic.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Try it</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Swap and Live are live at{" "}
          <a
            href="https://icpay.app"
            className="underline underline-offset-2 hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            icpay.app
          </a>
          . New here? Start with{" "}
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            what is ICP
          </Link>{" "}
          or{" "}
          <Link href="/blog/how-to-send-icp" className="underline underline-offset-2 hover:text-foreground">
            how to send ICP
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
