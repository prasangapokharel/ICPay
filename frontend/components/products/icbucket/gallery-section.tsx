"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function GallerySection() {
  const [currentImage, setCurrentImage] = useState(0)

  const images = [
    {
      src: "/images/product/icbuckets/demo/1.png",
      alt: "ICBucket Dashboard - Manage your on-chain storage",
    },
    {
      src: "/images/product/icbuckets/demo/2.png",
      alt: "ICBucket File Manager - Upload and organize files",
    },
    {
      src: "/images/product/icbuckets/demo/3.png",
      alt: "ICBucket API Keys - Secure programmatic access",
    },
  ]

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <section className="border-t py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              See ICBucket in Action
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Intuitive interface for managing your on-chain storage, files, and API keys.
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={images[currentImage].src}
                    alt={images[currentImage].alt}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevImage}
                    className="bg-background/80 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextImage}
                    className="bg-background/80 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-2 p-4">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentImage
                        ? "w-8 bg-primary"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentImage
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <Image src={image.src} alt={image.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
