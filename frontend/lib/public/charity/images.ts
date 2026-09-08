const charity = (segment: string) => `/images/pages/charity/${segment}` as const

export const CHARITY_IMAGES = {
  nepalFlashFlood: {
    hero: charity("nepal/scene/nepal-flash-flood-damage-03.webp"),
    scenes: [
      {
        src: charity("nepal/scene/nepal-flash-flood-flooding-01.webp"),
        alt: "Nepal flash flood — submerged homes and rising water",
      },
      {
        src: charity("nepal/scene/nepal-flash-flood-rescue-02.webp"),
        alt: "Nepal flash flood — rescue teams helping affected families",
      },
      {
        src: charity("nepal/scene/nepal-flash-flood-street-04.webp"),
        alt: "Nepal flash flood — flooded street and debris",
      },
      {
        src: charity("nepal/scene/nepal-flash-flood-landslide-05.webp"),
        alt: "Nepal flash flood — landslide impact in hill districts",
      },
    ],
    qr: {
      nepalPayLaxmiSunrise: charity("nepal/qr/nepalpay-qr-laxmi-sunrise-bank.webp"),
      nepalPayHimalayanBank: charity("nepal/qr/nepalpay-qr-himalayan-bank-pm-disaster-relief.webp"),
      fonepayUpi: charity("nepal/qr/fonepay-upi-esewa-qr.webp"),
    },
  },
} as const
