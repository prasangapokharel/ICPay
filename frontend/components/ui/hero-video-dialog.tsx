"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, PlayIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/ui/utils"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.85, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

function isDirectVideo(url: string) {
  return (
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov") ||
    url.includes("video/upload")
  )
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const selectedAnimation = animationVariants[animationStyle]
  const isDirect = isDirectVideo(videoSrc)

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Play video"
        className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card p-0 shadow-sm transition-all duration-300 hover:border-border hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsVideoOpen(true)}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={thumbnailSrc}
            alt={thumbnailAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="size-full object-cover transition-all duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
          />
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 sm:size-24 items-center justify-center rounded-full bg-background/20 p-2 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-background/30">
            <div className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105">
              <HugeiconsIcon
                icon={PlayIcon}
                className="size-7 sm:size-8 fill-current ml-1"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsVideoOpen(false)
              }
            }}
            onClick={() => setIsVideoOpen(false)}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer shadow-md"
                aria-label="Close video"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </button>

              {isDirect ? (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="size-full rounded-2xl object-cover"
                />
              ) : (
                <iframe
                  src={videoSrc}
                  title="Video player"
                  className="size-full rounded-2xl border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
