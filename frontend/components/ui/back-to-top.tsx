"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/ui/utils"

export function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > threshold)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Button
      type="button"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50 size-11 rounded-full shadow-lg transition-all duration-200",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-label="Back to top"
    >
      <HugeiconsIcon icon={ArrowUp01Icon} className="size-5" strokeWidth={2} />
    </Button>
  )
}
