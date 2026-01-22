import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nobles Lighthouse System",
    short_name: "NLH System",
    description:
      "Church Stock Taking & Monitoring System - A premium inventory management solution for houses of worship",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [
      {
        src: "/fav.png",
        sizes: "any",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  }
}
