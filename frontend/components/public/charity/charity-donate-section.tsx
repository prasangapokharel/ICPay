"use client"

import Image from "next/image"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CharityDonateSectionProps = {
  campaign: CharityCampaign
}

export function CharityDonateSection({ campaign }: CharityDonateSectionProps) {
  const defaultTab = campaign.donateGroups[0]?.id ?? "donate"

  return (
    <section className="border-b border-border/60 bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-8 max-w-3xl space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Donate</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Scan an official government QR code with your banking or wallet app. Payments go
            directly to the Prime Minister Disaster Relief Fund.
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="mx-auto max-w-4xl gap-6">
          <TabsList className="mx-auto w-full max-w-xl">
            {campaign.donateGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id} className="flex-1 text-xs sm:text-sm">
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {campaign.donateGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="space-y-6">
              <p className="text-center text-sm text-muted-foreground">{group.hint}</p>
              <div
                className={
                  group.options.length > 1
                    ? "grid gap-6 md:grid-cols-2"
                    : "mx-auto max-w-md"
                }
              >
                {group.options.map((option) => (
                  <Card key={option.id} className="overflow-hidden border-border/60">
                    <CardHeader className="space-y-1 border-b border-border/60 pb-4">
                      <CardTitle className="text-base">{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-white p-6 dark:bg-zinc-950">
                      <Image
                        src={option.image}
                        alt={option.imageAlt}
                        title={option.imageAlt}
                        width={320}
                        height={320}
                        unoptimized
                        className="h-auto w-full max-w-[280px]"
                        style={{ height: "auto" }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 text-center">
          <Button
            nativeButton={false}
            render={
              <Link href={campaign.officialUrl} target="_blank" rel="noopener noreferrer" />
            }
            className="rounded-full px-6"
          >
            Open official donation portal
            <ExternalLinkIcon className="size-4" />
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cards, SWIFT, and international donations are available on the official Government of
            Nepal portal.
          </p>
        </div>
      </div>
    </section>
  )
}
