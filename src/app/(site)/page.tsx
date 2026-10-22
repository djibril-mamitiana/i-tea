import { Bestsellers } from "@/components/sections/Bestsellers";
import { Categories } from "@/components/sections/Categories";
import { Hero } from "@/components/sections/Hero";
import { Menu } from "@/components/sections/Menu";
import { Offers } from "@/components/sections/Offers";
import { Reassurance } from "@/components/sections/Reassurance";
import { ServiceStrip } from "@/components/sections/ServiceStrip";
import { site } from "@/config/site";

// Données structurées : uniquement les champs réellement renseignés.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  description: site.description,
  url: site.url,
  servesCuisine: ["Bubble tea", "Thé", "Snacks"],
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
      <ServiceStrip />
      <Categories />
      <Bestsellers />
      <Offers />
      <Menu />
      <Reassurance />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
