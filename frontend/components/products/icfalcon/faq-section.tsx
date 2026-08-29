import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is ICFalcon?",
    answer:
      "ICFalcon is an open-source Motoko framework for building Internet Computer applications. It provides a production-ready backend architecture, a Next.js frontend, and a global CLI for scaffolding, building, and deploying.",
  },
  {
    question: "Do I need to know Motoko to use ICFalcon?",
    answer:
      "Yes. ICFalcon is a Motoko framework, so familiarity with the language is required. However, the layered architecture and scaffolding commands reduce the amount of boilerplate you need to write manually.",
  },
  {
    question: "How is ICFalcon different from dfx new?",
    answer:
      "dfx new gives you a minimal starting point. ICFalcon gives you a production-shaped structure with enforced layering, stable memory management, Internet Identity integration, and a CLI for scaffolding modules. It is opinionated by design.",
  },
  {
    question: "Can I use ICFalcon with an existing canister?",
    answer:
      "ICFalcon is designed as a starting point, not a migration tool. If you have an existing canister, you can adopt parts of the architecture (the layering pattern, the CLI commands) but full integration would require manual work.",
  },
  {
    question: "What is the falcon CLI?",
    answer:
      "The falcon CLI is a global command that wraps dfx, mops, and npm. It handles project initialization, module scaffolding, testing, building, and deployment. Commands target local or mainnet with a --local flag.",
  },
  {
    question: "Where do I install packages from?",
    answer:
      "Backend packages are installed from mops (Motoko package manager) and icp-hub (a curated collection of plug-and-play modules). Frontend packages are npm. The falcon CLI abstracts some of this with `falcon add pkg <name>`.",
  },
  {
    question: "Is ICFalcon production-ready?",
    answer:
      "The architecture is production-ready and is used in live apps like ICPay. However, ICFalcon itself is a framework, not a SaaS product. You own your canister and are responsible for testing, deployment, and maintenance.",
  },
  {
    question: "Does ICFalcon support Rust canisters?",
    answer:
      "No. ICFalcon is a Motoko framework. If you need Rust, you would use a different starter or build from scratch.",
  },
  {
    question: "How do I deploy to mainnet?",
    answer:
      "Run `falcon b:deploy` (without --local). The CLI will prompt for confirmation before deploying to mainnet. Upgrade mode is the default; reinstall mode is never used to avoid data loss.",
  },
  {
    question: "Can I customize the layering?",
    answer:
      "The four-layer architecture (api → service → repository → storage) is enforced by convention and the CLI scaffolds. You can deviate, but you lose the benefits of consistent structure and automated scaffolding.",
  },
  {
    question: "How do I contribute to ICFalcon?",
    answer:
      "Fork the repository, create a feature branch, and open a pull request. Follow the patterns in AGENTS.md and run `falcon b:test --local` and `falcon p:check --local` before submitting. For hub packages, contribute to icp-hub separately.",
  },
  {
    question: "Is ICFalcon free to use?",
    answer:
      "Yes. ICFalcon is open-source. Source code is provided as-is for use and modification. Hub packages are licensed per their entries on icp-hub.",
  },
]

export function FaqSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Common questions about ICFalcon and how to use it
          </p>
        </div>

        <Accordion>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      </div>
    </section>
  )
}
