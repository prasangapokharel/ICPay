import type { MetadataRoute } from "next"

// output: "export" cannot defer this to a server, so it is emitted at build time.
export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ICPay — Send ICP by Username",
    short_name: "ICPay",
    description:
      "Send and receive Internet Computer tokens using a username instead of a principal address.",
    start_url: "/",
    display: "standalone",
    // sRGB equivalents of --background and --primary in globals.css; a manifest
    // cannot reference a CSS custom property.
    background_color: "#ffffff",
    theme_color: "#c6005c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
