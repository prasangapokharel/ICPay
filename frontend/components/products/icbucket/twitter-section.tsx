"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"

interface TweetData {
  id: string
  url: string
  author: {
    name: string
    handle: string
    avatar: string
    verified: boolean
  }
  content: React.ReactNode
  image?: string
  imageAlt?: string
}

function VerifiedBadge() {
  return (
    <svg
      className="size-4 shrink-0 text-[#1d9bf0]"
      viewBox="0 0 22 22"
      fill="currentColor"
      aria-label="Verified account"
    >
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.136 5.864-5.864 1.293 1.302-7.157 7.156z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const ICPAY_AVATAR =
  "https://pbs.twimg.com/profile_images/2085037765591502851/Rka1jNo-_400x400.jpg"

const TWEETS: TweetData[] = [
  {
    id: "2087599956337262864",
    url: "https://x.com/IcpayOfficial/status/2087599956337262864",
    author: {
      name: "ICPay",
      handle: "@IcpayOfficial",
      avatar: ICPAY_AVATAR,
      verified: true,
    },
    content: (
      <div className="space-y-2.5">
        <p>
          Introducing <strong className="font-semibold text-foreground">ICPay Bucket</strong> ✨
        </p>
        <p>
          Fast, secure, and fully on-chain storage built directly on the{" "}
          <span className="font-medium text-[#1d9bf0]">@dfinity</span> Internet Computer.
        </p>
        <p>
          Store files on-chain and serve them through a dedicated CDN — without relying on traditional centralized object storage.
        </p>
      </div>
    ),
    image: "https://pbs.twimg.com/media/HSzhL4nacAAKAbk?format=jpg&name=small",
    imageAlt: "ICPay Bucket on-chain cloud storage",
  },
  {
    id: "2087727478622302477",
    url: "https://x.com/IcpayOfficial/status/2087727478622302477",
    author: {
      name: "ICPay",
      handle: "@IcpayOfficial",
      avatar: ICPAY_AVATAR,
      verified: true,
    },
    content: (
      <div className="space-y-2.5">
        <p>
          <strong className="font-semibold text-foreground">ICPay Cloud API keys</strong> are live 🔑
        </p>
        <p>
          Automate uploads to the Internet Computer — no wallet session, no manual clicks.
        </p>
        <p className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border/40">
          icp_cloud_* keys · scoped per bucket · Write/Delete permissions
        </p>
        <p>
          <span className="font-semibold text-foreground">Why it matters:</span> CI/CD deploys assets straight to on-chain storage.
        </p>
      </div>
    ),
    image: "https://pbs.twimg.com/media/HR12ymxa8AAEnNA?format=png&name=small",
    imageAlt: "ICPay Cloud API keys automation workflow",
  },
  {
    id: "2088088717445747033",
    url: "https://x.com/IcpayOfficial/status/2088088717445747033",
    author: {
      name: "ICPay",
      handle: "@IcpayOfficial",
      avatar: ICPAY_AVATAR,
      verified: true,
    },
    content: (
      <div className="space-y-2.5">
        <p>
          <strong className="font-semibold text-foreground">Centralized storage vs. On-chain storage</strong> ⚡
        </p>
        <p>
          ICPay Bucket brings file storage directly to the Internet Computer:
        </p>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground list-disc list-inside pl-1">
          <li>Encrypted storage per bucket</li>
          <li>Public or private access controls</li>
          <li>Pay in ICP with simple 30-day plans</li>
          <li>Scoped API keys for CI/CD automation</li>
        </ul>
      </div>
    ),
    image: "https://pbs.twimg.com/media/HQkxqVBbUAAP8Ek?format=jpg&name=small",
    imageAlt: "Centralized storage vs On-chain storage comparison",
  },
]

export function TwitterSection() {
  const t = useTranslations("publicSite.icbucket.twitter")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 space-y-3 text-center md:mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TWEETS.map((tweet) => (
            <a
              key={tweet.id}
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-full border border-border/50 bg-muted shrink-0">
                      <Image
                        src={tweet.author.avatar}
                        alt={tweet.author.name}
                        width={40}
                        height={40}
                        className="size-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm sm:text-[15px] text-foreground">
                          {tweet.author.name}
                        </span>
                        {tweet.author.verified && <VerifiedBadge />}
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {tweet.author.handle}
                      </span>
                    </div>
                  </div>

                  <XIcon className="size-4 text-muted-foreground/70" />
                </div>

                {/* Tweet Body Content */}
                <div className="text-sm leading-relaxed text-foreground/90 font-normal">
                  {tweet.content}
                </div>
              </div>

              {/* Embedded Media */}
              {tweet.image && (
                <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-muted/40 aspect-[16/9] relative">
                  <Image
                    src={tweet.image}
                    alt={tweet.imageAlt || "Tweet attachment"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

