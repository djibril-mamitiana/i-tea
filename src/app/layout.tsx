import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Titres : Newsreader, serif éditorial (sous-ensemble vietnamien inclus pour les noms de plats).
const display = Newsreader({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

// Texte, prix, navigation, boutons : Be Vietnam Pro, dessinée pour le vietnamien (ở, ế, ạ… sans police de secours).
const body = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Cuisine vietnamienne, thés et desserts | Commande en ligne`,
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
  themeColor: "#234638",
};

/** Racine minimale : polices et styles. Le site public et l'admin ont chacun leur layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
