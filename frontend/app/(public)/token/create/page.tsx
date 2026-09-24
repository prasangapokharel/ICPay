"use client"

import { useTheme } from "next-themes"
import { PublicTokenCreate } from "@/components/launch/public-token-create"
import { Particles } from "@/components/ui/particles"

export default function PublicTokenCreatePage() {
  const { resolvedTheme } = useTheme()
  const particleColor = resolvedTheme === "light" ? "#000000" : "#ffffff"

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-border/60 bg-background">
      <Particles
        className="absolute inset-0 z-0"
        quantity={90}
        ease={80}
        color={particleColor}
        refresh
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 py-10 md:px-6 md:py-14">
        <PublicTokenCreate />
      </div>
    </section>
  )
}
