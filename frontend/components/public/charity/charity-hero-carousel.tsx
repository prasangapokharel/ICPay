"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/ui/utils"

type CharityHeroCarouselProps = {
  slides: readonly { src: string; alt: string }[]
}

export function CharityHeroCarousel({ slides }: CharityHeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || slides.length <= 1) return

    const timer = window.setInterval(() => api.scrollNext(), 5500)
    return () => window.clearInterval(timer)
  }, [api, slides.length])

  if (slides.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          aria-hidden
          className="absolute -right-2 top-4 bottom-4 left-4 rounded-[1.75rem] bg-foreground/10"
        />
        <div
          aria-hidden
          className="absolute -right-4 top-7 bottom-7 left-7 rounded-[1.75rem] bg-foreground/5"
        />

        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "center" }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <CarouselContent className="ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.src} className="basis-full pl-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-muted shadow-2xl shadow-foreground/10">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    title={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 520px"
                    draggable={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {slides.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === current}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === current
                  ? "w-6 bg-foreground"
                  : "w-2 bg-foreground/25 hover:bg-foreground/40"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
