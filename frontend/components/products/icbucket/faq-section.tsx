import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageQuestionIcon } from "@hugeicons/core-free-icons"

export function FaqSection() {
  const faqs = [
    {
      question: "How is ICBucket different from AWS S3?",
      answer:
        "ICBucket is decentralized storage on the Internet Computer. You pay in ICP every 30 days from your ICPay balance (e.g. 2.5 ICP for 5 GB) instead of a credit-card AWS bill. Files live on-chain across IC replicas. API keys and SDKs make migration straightforward.",
    },
    {
      question: "How does billing work?",
      answer:
        "Each bucket is a 30-day plan paid upfront in ICP from your ICPay balance. When it expires the bucket becomes read-only until you renew. Renewing adds another 30 days — unused time stacks. Prices are quoted live from the canister (cycle cost + margin).",
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
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <HugeiconsIcon
              icon={MessageQuestionIcon}
              className="mx-auto size-8 text-primary"
            />
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
        </div>
      </div>
    </section>
  )
}
