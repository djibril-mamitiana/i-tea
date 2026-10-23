import { Bestsellers } from "@/components/sections/Bestsellers";
import { BrandSection } from "@/components/sections/BrandSection";
import { Categories } from "@/components/sections/Categories";
import { Hero } from "@/components/sections/Hero";
import { InfoSection } from "@/components/sections/InfoSection";
import { Menu } from "@/components/sections/Menu";
import { Offers } from "@/components/sections/Offers";
import { ReassuranceBar } from "@/components/sections/ReassuranceBar";
import { Reviews } from "@/components/sections/Reviews";
import { site } from "@/config/site";

// Données structurées : uniquement les champs réellement renseignés.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  description: site.description,
  url: site.url,
  servesCuisine: ["Cuisine vietnamienne", "Bubble tea", "Café"],
  image: `${site.url}${site.logo}`,
  ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
  ...(site.contact.address ? { address: site.contact.address } : {}),
  ...(site.contact.email ? { email: site.contact.email } : {}),
  hasMenu: `${site.url}/#menu`,
  acceptsReservations: false,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReassuranceBar />
      <Categories />
      <Bestsellers />
      <BrandSection />
      <Offers />
      <Menu />
      <Reviews />
      <InfoSection />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
