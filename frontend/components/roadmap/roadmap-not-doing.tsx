"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { NOT_DOING } from "./roadmap-data"

// A roadmap that only lists what you will build is a wish list. The refusals
// carry more signal than the plans, so they get their own section.
export function RoadmapNotDoing() {
  return (
    <section className="rounded-2xl border border-dashed p-4">
      <h2 className="text-sm font-semibold">Deliberately not building</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Saying no is part of a roadmap. Tap any item for the reason.
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {NOT_DOING.map((item) => (
          <li key={item.title}>
            <HoverCard>
              <HoverCardTrigger
                render={<button type="button" />}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                {item.title}
              </HoverCardTrigger>
              <HoverCardContent className="w-72 text-xs leading-relaxed">{item.why}</HoverCardContent>
            </HoverCard>
          </li>
        ))}
      </ul>
    </section>
  )
}
