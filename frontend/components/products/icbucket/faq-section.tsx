import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageQuestionIcon, Github01Icon } from "@hugeicons/core-free-icons"

export function FaqSection() {
  const faqs = [
    {
      question: "How is ICBucket different from AWS S3?",
      answer:
        "ICBucket is decentralized, built on Internet Computer. You pay once (1-10 ICP) instead of monthly fees. Files are stored on-chain across IC replicas, not on AWS servers. No account suspension risk, no vendor lock-in. S3-compatible API means easy migration.",
    },
    {
      question: "What does 'pay once, store forever' mean?",
      answer:
        "You pay a one-time fee based on capacity (e.g., 3 ICP for 5GB). Files remain on-chain as long as the canister has cycles. ICBucket canisters are topped up automatically from bucket revenue. Typical bucket lasts 1-2 years before renewal needed. You can renew anytime to extend duration.",
    },
    {
      question: "Can I use ICBucket for production apps?",
      answer:
        "Yes. ICBucket is production-ready with 33 passing tests, chunked uploads, API key auth, and cycle monitoring. It's already used for NFT metadata, dApp assets, and static sites. That said, it's custodial storage on IC — understand the trade-offs before deploying mission-critical data.",
    },
    {
      question: "What file types are supported?",
      answer:
        "All file types: images, videos, PDFs, JSON, HTML, CSS, JS, etc. Content type is preserved. Public buckets serve files with correct MIME types for direct browser access (e.g., <img src='...'> works).",
    },
    {
      question: "How do I migrate from S3 to ICBucket?",
      answer:
        "Install icpay-bucket SDK, create a bucket, generate API key. Replace AWS SDK calls with ICBucket SDK calls (nearly identical API). Download files from S3, upload to ICBucket. Update URLs in your app. Most migrations take <1 hour for small projects.",
    },
    {
      question: "What happens if the canister runs out of cycles?",
      answer:
        "ICBucket canisters are monitored and topped up automatically from bucket revenue. If cycles drop critically low, we notify bucket owners to renew. In the worst case (canister deleted), files are lost — but this is extremely rare with proper cycle management.",
    },
    {
      question: "Can I use ICBucket for NFT metadata?",
      answer:
        "Yes, perfect use case. Upload metadata.json and image files. Get immutable on-chain URLs (https://6vbhm-...-cai.icp0.io/bucket/nft-1.json). No IPFS gateways, no broken links. Public buckets serve files instantly.",
    },
    {
      question: "Is there a file size limit?",
      answer:
        "Single file uploads are limited to 2MB per request (IC call size limit). For larger files, use chunked uploads — split files into 2MB chunks client-side. The SDK handles this automatically. Tested up to 500MB files.",
    },
    {
      question: "Can I delete files?",
      answer:
        "Yes, bucket owners can delete files via web UI or API. Deleted files are immediately removed from the canister. Storage quota is freed up. Bulk delete is supported for cleaning up many files at once.",
    },
    {
      question: "How do I make a bucket public?",
      answer:
        "Set visibility: 'public' when creating the bucket. Public buckets serve files via HTTPS without auth. Anyone with the URL can access files. Perfect for static sites, public assets, and NFT metadata.",
    },
    {
      question: "Can I host a static website on ICBucket?",
      answer:
        "Yes. Upload HTML, CSS, JS, images to a public bucket. Access via canister URL (https://6vbhm-...-cai.icp0.io/bucket/index.html). Set content types correctly. No index.html auto-serve yet — specify full path in URL.",
    },
    {
      question: "What's the difference between ICBucket and IPFS?",
      answer:
        "ICBucket stores files in IC canisters with S3-compatible API. IPFS is content-addressed, peer-to-peer. ICBucket has no gateway dependencies, instant access, and simpler API. IPFS has better decentralization but slower/unpredictable access. Choose based on your needs.",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <HugeiconsIcon icon={MessageQuestionIcon} className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to know about ICBucket. Can&apos;t find an answer? Contact us.
            </p>
          </div>

          <div className="w-full space-y-4">
            <Accordion>
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="mt-12 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <h3 className="text-xl font-semibold">More questions?</h3>
              <p className="text-sm text-muted-foreground">
                Check out the full documentation or reach out to our team.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="https://icpay.app/bucket/docs">
                  <Button variant="outline">Documentation</Button>
                </Link>
                <Link
                  href="https://github.com/prasangapokharel/ICPay"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <HugeiconsIcon icon={Github01Icon} className="mr-2 size-4" />
                    GitHub
                  </Button>
                </Link>
                <Link href="https://discord.gg/icpay" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Discord</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
