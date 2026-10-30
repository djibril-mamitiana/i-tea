import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, DM_Sans, Playfair_Display } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Playfair Display : le serif élégant des titres des affiches d'I Tea (avec le vietnamien : « phở »).
const display = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// DM Sans n'a pas de glyphes vietnamiens (ở, ế…) : cette police ne sert que pour ces caractères (repli du texte).
const vietnamese = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vietnamese",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Cuisine vietnamienne, bubble tea & gourmandises | Commande en ligne`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} — Commande en ligne`,
    description: site.description,
  },
  robots: site.demoMode ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3b23",
};

/** Racine minimale : polices et styles. Le site public et l'admin ont chacun leur layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${vietnamese.variable}`}>
      <body>{children}</body>
    </html>
  );
}
