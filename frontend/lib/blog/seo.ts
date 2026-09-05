const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function blogCanonical(slug: string): string {
  return `${siteUrl}/blog/${slug}`
}

export function blogArticleJsonLd({
  slug,
  title,
  description,
  publishedAt,
  readingMinutes,
}: {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
}) {
  const url = blogCanonical(slug)
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { "@type": "Organization", name: "ICPay", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "ICPay",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    timeRequired: `PT${readingMinutes}M`,
    isPartOf: { "@type": "Blog", name: "ICPay Blog", url: `${siteUrl}/blog` },
  }
}
