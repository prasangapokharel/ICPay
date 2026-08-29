import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    question: "What is ICPay?",
    answer:
      "ICPay is a custodial Internet Computer wallet. You sign in with Internet Identity, claim a username, and send or receive ICP using that handle instead of copying a long principal address.",
  },
  {
    question: "Do I need a seed phrase?",
    answer:
      "No. Authentication is handled by Internet Identity. You approve access with a passkey or a linked identity provider — there is no mnemonic to store on paper.",
  },
  {
    question: "Is ICPay self-custodial?",
    answer:
      "ICPay is custodial: your balance is held in a per-user subaccount controlled by the ICPay canister, and only your principal can authorize transfers. The backend code is open source and deployed on mainnet.",
  },
  {
    question: "What else is included besides the wallet?",
    answer:
      "The same ecosystem includes public Channels, ICBucket on-chain storage, and ICFalcon — a Motoko framework for building and deploying canisters with a structured CLI.",
  },
  {
    question: "How do Channels work?",
    answer:
      "Channels are broadcast communities. Owners post updates with Telegram-style markdown. Public channels can be discovered in Explore; private channels are reachable by username or invite link.",
  },
  {
    question: "Where can I read more?",
    answer:
      "Visit the About, FAQ, and Transparency pages for product details, or browse the blog for Internet Computer guides and developer resources.",
  },
] as const

export function LandingFaq() {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">FAQ</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Common questions</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Quick answers about the wallet, custody model, and the rest of the ICPay stack.
          </p>
        </div>

        <Accordion className="bg-card">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="px-3 text-left text-sm font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
