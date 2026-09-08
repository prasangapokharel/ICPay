import { CHARITY_IMAGES } from "@/lib/public/charity/images"

export const PMDRF_OFFICIAL_URL = "https://pmdrf.nchl.com.np/"

export type CharityQrOption = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
}

export type CharityStat = {
  value: string
  label: string
  source: string
}

export type CharityVideo = {
  id: string
  url: string
  title: string
  description: string
}

export type CharityFaqItem = {
  question: string
  answer: string
}

export type CharityStorySection = {
  heading: string
  paragraphs: string[]
}

export type CharitySource = {
  label: string
  href: string
}

export type CharityCampaign = {
  slug: string
  href: string
  country: string
  countryLabel: string
  title: string
  h1: string
  subtitle: string
  description: string
  heroImage: string
  heroImageAlt: string
  officialUrl: string
  sceneImages: readonly { src: string; alt: string }[]
  stats?: CharityStat[]
  statsImage?: { src: string; alt: string }
  statsNote?: string
  videos?: CharityVideo[]
  donateGroups: {
    id: string
    label: string
    hint: string
    options: CharityQrOption[]
  }[]
  story: {
    heading: string
    paragraphs: string[]
    updates?: string[]
  }
  storySections?: CharityStorySection[]
  faq?: CharityFaqItem[]
  sources?: CharitySource[]
  keywords: string[]
}

export const NEPAL_FLASH_FLOOD_CAMPAIGN: CharityCampaign = {
  slug: "nepal-flash-flood",
  href: "/charity/nepal/nepal-flash-flood",
  country: "nepal",
  countryLabel: "Nepal",
  title: "Nepal Flash Flood Relief",
  h1: "Nepal Flash Flood 2026 — Rescue Updates & Official Donation QR Codes",
  subtitle:
    "Rescue efforts continue on the Nepal–Tibet border after a catastrophic flash flood. Donate directly to the Government of Nepal Prime Minister Disaster Relief Fund.",
  description:
    "Nepal flash flood 2026: at least 675 dead, 1,473 injured, and 2,498 missing after a glacial collapse near the Tibet border. Official PM Disaster Relief Fund QR codes for NepalPay, Fonepay, UPI, and eSewa. ICPay does not collect donations.",
  heroImage: CHARITY_IMAGES.nepalFlashFlood.hero,
  heroImageAlt:
    "Nepal flash flood — damaged buildings after heavy rainfall",
  officialUrl: PMDRF_OFFICIAL_URL,
  sceneImages: CHARITY_IMAGES.nepalFlashFlood.scenes,
  stats: [
    {
      value: "675+",
      label: "Deaths",
      source: "Nepal NDRRMA, 30 Aug 2026",
    },
    {
      value: "1,473+",
      label: "Injuries",
      source: "Nepal NDRRMA, 30 Aug 2026",
    },
    {
      value: "2,498",
      label: "Missing",
      source: "Nepal NDRRMA, 30 Aug 2026",
    },
  ],
  statsImage: {
    src: CHARITY_IMAGES.nepalFlashFlood.scenes[1].src,
    alt: "Nepal flash flood — rescue teams helping affected families",
  },
  statsNote:
    "Figures are from Nepal's National Disaster Risk Reduction and Management Authority (NDRRMA) as of 30 August 2026. Regional totals including Tibet: 691+ deaths and 3,044+ missing. More than 7,500 people have been rescued and about 3,500 are sheltered in relief camps. Numbers may change as operations continue.",
  videos: [
    {
      id: "worldranking-flood-video",
      url: "https://x.com/worldranking_/status/2093896501424746546/video/1",
      title: "Flash flood debris flow — border region",
      description: "Video shared on X showing the force of the flood surge in the Himalayan border area.",
    },
    {
      id: "maratha-news-flood-video",
      url: "https://x.com/Maratha_NEWz/status/2093745787394212163/video/1",
      title: "On-the-ground flood impact",
      description: "Footage circulated on X highlighting damage and emergency conditions after the flash flood.",
    },
    {
      id: "gramergolpo-flood-video",
      url: "https://x.com/Gramergolpo/status/2093896745453547566/video/1",
      title: "Nepal flood surge footage",
      description: "Video shared on X showing floodwater and debris moving through affected areas.",
    },
  ],
  donateGroups: [
    {
      id: "nepalpay",
      label: "Mobile banking / NepalPay",
      hint: "Scan with mobile banking, connectIPS, eSewa, IME Pay, or NepalPay-enabled apps",
      options: [
        {
          id: "laxmi-sunrise",
          title: "Laxmi Sunrise Bank — NepalPay QR",
          description: "Official PM Disaster Relief Fund QR via Laxmi Sunrise Bank",
          image: CHARITY_IMAGES.nepalFlashFlood.qr.nepalPayLaxmiSunrise,
          imageAlt: "Nepal PM Disaster Relief Fund NepalPay QR — Laxmi Sunrise Bank",
        },
        {
          id: "himalayan-bank",
          title: "Himalayan Bank — NepalPay QR",
          description: "Official PM Disaster Relief Fund QR via Himalayan Bank",
          image: CHARITY_IMAGES.nepalFlashFlood.qr.nepalPayHimalayanBank,
          imageAlt: "Nepal PM Disaster Relief Fund NepalPay QR — Himalayan Bank",
        },
      ],
    },
    {
      id: "fonepay",
      label: "Fonepay / UPI / eSewa",
      hint: "Scan with Fonepay, UPI-India, UnionPay, eSewa, or mobile banking apps",
      options: [
        {
          id: "fonepay-upi",
          title: "Fonepay — UPI & wallets QR",
          description: "Official PM Disaster Relief Fund QR for Fonepay, UPI, and digital wallets",
          image: CHARITY_IMAGES.nepalFlashFlood.qr.fonepayUpi,
          imageAlt: "Nepal PM Disaster Relief Fund Fonepay UPI eSewa donation QR code",
        },
      ],
    },
  ],
  story: {
    heading: "What happened on the Nepal–Tibet border?",
    paragraphs: [
      "On Wednesday, 27 August 2026, a glacial collapse upstream triggered a catastrophic flash flood along the Nepal–Tibet border. A torrent of rock, ice, mud, and debris surged through river valleys — described by survivors and responders as a tsunami-like wall of water — burying villages, roads, bridges, and hydropower infrastructure within hours.",
      "Rescue efforts entered a fifth day as teams searched mud-choked valleys from Rasuwa and the Trishuli corridor in Nepal to Gyirong on the Chinese side of the border. More than 3,700 people had been rescued in Nepal by late August, but thousands remained unaccounted for across both countries.",
      "The Government of Nepal opened the Prime Minister Disaster Relief Fund (PMDRF) for domestic and international donations. ICPay publishes only official government QR codes so you can give directly — we do not collect, hold, or route relief money.",
    ],
    updates: [
      "ICPay shares only official government QR codes published for the Prime Minister Disaster Relief Fund.",
      "Verify the amount and currency before you pay. Government disaster relief donations are non-refundable.",
      "For card payments, SWIFT transfers, or international donations, use the official portal at pmdrf.nchl.com.np.",
    ],
  },
  storySections: [
    {
      heading: "Rescue efforts on the Nepal–Tibet border",
      paragraphs: [
        "Search and rescue operations continued at multiple sites including the Upper Trishuli-1 hydropower project in Rasuwa district and the heavily damaged Gyirong border crossing in Tibet. Nepali Army teams inserted air pipes into the Trishuli 3A hydropower tunnel to supply oxygen to workers believed trapped underground.",
        "Nepal's foreign ministry said the country welcomed specialist technical help for tunnel rescue, restoring transport links where bridges were destroyed, DNA identification of victims, and longer-term body storage — while noting that general search-and-rescue capacity was already mobilised.",
        "India, China, and other partners offered specialist teams and equipment as responders worked through rain, landslide risk, and blocked access roads.",
      ],
    },
    {
      heading: "Impact in Nepal",
      paragraphs: [
        "Nepali authorities reported at least 675 deaths, 1,473 injuries, and 2,498 people missing nationwide as of 30 August 2026. Nepal's tourism board said at least 589 foreign nationals were among the missing, including trekkers and pilgrims travelling toward Tibet.",
        "Hundreds of hydropower workers were unaccounted for across projects in the Trishuli corridor. The Independent Power Producers' Association, Nepal estimated more than 900 people linked to multiple power projects remained out of contact at the height of the crisis.",
        "Entire settlements were engulfed along the Bhotekoshi and Trishuli river systems. Survivors described sudden inundation with little warning as debris dams broke and floodwalls failed.",
      ],
    },
    {
      heading: "Impact in Tibet and the formed lake",
      paragraphs: [
        "On the Chinese side, state media reported 16 deaths and 546 people missing in Tibet, with Gyirong County among the hardest-hit areas. Information is more tightly controlled by Chinese authorities, and independent verification has been harder than on the Nepali side of the border.",
        "The flood also formed a temporary lake across the border. Chinese officials said water levels at that lake — which had raised fears of a secondary overflow — were receding by late August, though operations were briefly paused in some areas while the risk was assessed.",
        "Chinese state media reported more than 2,100 rescuers deployed near Gyirong, with hundreds evacuated from stranded tourist and residential areas.",
      ],
    },
    {
      heading: "What caused the Nepal flash flood?",
      paragraphs: [
        "The U.S. Geological Survey attributed the disaster to a glacial collapse that sent a high-energy debris flow downstream. Climate scientists have long warned that warming Himalayan glaciers increase the risk of glacial lake outburst floods and sudden slope failures in high mountain terrain.",
        "The event was not a typical slow monsoon swell. It was a rapid cascade of ice, rock, and sediment that overwhelmed river channels designed for seasonal rainfall — explaining why damage extended far beyond usual flood zones.",
      ],
    },
  ],
  faq: [
    {
      question: "How many people died in the Nepal flash flood?",
      answer:
        "Nepali disaster authorities reported at least 675 deaths in Nepal as of late August 2026. Chinese state media reported 16 deaths in Tibet. The combined cross-border toll exceeded 690, and figures may rise as search teams reach isolated areas.",
    },
    {
      question: "How many people are still missing?",
      answer:
        "2,498 people were reported missing in Nepal and 546 in Tibet according to official figures as of 30 August 2026. Nepal's tourism board said at least 589 foreign nationals were among those missing in Nepal.",
    },
    {
      question: "What caused the Nepal–Tibet flash flood?",
      answer:
        "Scientists and disaster agencies said a glacial collapse upstream released a massive debris flow — a mixture of ice, rock, mud, and water — that raced down river valleys on 27 August 2026, destroying infrastructure and settlements along the border.",
    },
    {
      question: "How do I donate to the Nepal flood relief fund officially?",
      answer:
        "Use the official Government of Nepal Prime Minister Disaster Relief Fund. On this page you can scan verified NepalPay or Fonepay QR codes, or visit pmdrf.nchl.com.np for cards, mobile banking, connectIPS, eSewa, IME Pay, and international payment options.",
    },
    {
      question: "Does ICPay collect charity donations?",
      answer:
        "No. ICPay does not collect, store, or process disaster donations. We only display official government QR codes and link to the government portal so your payment goes directly to the Prime Minister Disaster Relief Fund.",
    },
    {
      question: "Are foreign tourists among the missing?",
      answer:
        "Yes. Nepal's tourism board reported at least 320 foreign nationals among the missing, including trekkers and pilgrims. Broader official missing-person lists also included hundreds of foreign citizens travelling in the affected border region.",
    },
    {
      question: "Is the border lake still dangerous?",
      answer:
        "A lake formed after the flood raised short-term fears of renewed overflow into Nepal's Lhende Khola and Trishuli rivers. Chinese officials said levels were receding by late August 2026, but authorities in both countries continued to monitor the site.",
    },
    {
      question: "Where are rescue teams focused?",
      answer:
        "Priority sites include hydropower tunnels along the Trishuli corridor in Nepal — especially Trishuli 3A and 3B — and the Gyirong border complex in Tibet, where roads and bridges were destroyed by the debris flow.",
    },
  ],
  sources: [
    {
      label: "AP News — Rescuers search for thousands after floods at Nepal-China border",
      href: "https://apnews.com/article/nepal-china-flood-rescue-fde34c839b648f93f6aa011f044deb00",
    },
    {
      label: "RTE — Nepal resumes flood rescue, seeks technical help",
      href: "https://www.rte.ie/news/world/2026/0829/1589644-nepal-flood-aftermath/",
    },
    {
      label: "Kathmandu Post — Hydropower tunnels after Bhotekoshi flood",
      href: "https://kathmandupost.com/national/2026/08/29/hundreds-feared-trapped-in-hydropower-tunnels-after-bhotekoshi-flood",
    },
    {
      label: "Official PM Disaster Relief Fund — Government of Nepal",
      href: PMDRF_OFFICIAL_URL,
    },
  ],
  keywords: [
    "Nepal flash flood 2026",
    "Nepal Tibet border flood",
    "Nepal flood donation",
    "Prime Minister Disaster Relief Fund",
    "PMDRF",
    "Nepal glacial flood",
    "Bhotekoshi flood",
    "Trishuli flood",
    "Gyirong Tibet flood",
    "Nepal missing foreigners",
    "NepalPay QR donation",
    "Fonepay Nepal donation",
    "eSewa disaster relief",
    "donate Nepal flood victims",
  ],
}

export const CHARITY_CAMPAIGNS = [NEPAL_FLASH_FLOOD_CAMPAIGN] as const

export function getCharityCampaign(slug: string): CharityCampaign | undefined {
  return CHARITY_CAMPAIGNS.find((campaign) => campaign.slug === slug)
}
