import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { Hero } from "@/components/sections/Hero";
import { InfoSection } from "@/components/sections/InfoSection";
import { Menu } from "@/components/sections/Menu";
import { Reviews } from "@/components/sections/Reviews";
import { Selection } from "@/components/sections/Selection";
import { Story } from "@/components/sections/Story";
import { site } from "@/config/site";

// Données structurées : uniquement les champs réellement renseignés.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  description: site.description,
  url: site.url,
  servesCuisine: ["Vietnamienne"],
  ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
  ...(site.contact.address ? { address: site.contact.address } : {}),
  ...(site.contact.email ? { email: site.contact.email } : {}),
  hasMenu: `${site.url}/#carte`,
  acceptsReservations: false,
};

export default function HomePage() {
  const { sections, media } = site;
  return (
    <>
      <Hero />
      <Selection />
      <CategoryShowcase
        categoryId="cuisine"
        media={media.cuisine}
        tone="sand"
        copy={sections.cuisine}
        photoLabel="Plat vietnamien généreux, herbes fraîches visibles, vue 3/4, lumière naturelle"
      />
      <CategoryShowcase
        categoryId="boissons"
        media={media.boissons}
        tone="green"
        reverse
        copy={sections.boissons}
        photoLabel="Boisson (thé ou café) en gros plan, couleurs naturelles, lumière du jour"
      />
      <CategoryShowcase
        categoryId="desserts"
        media={media.desserts}
        tone="cream"
        copy={sections.desserts}
        photoLabel="Dessert appétissant, texture visible, vue de dessus ou 3/4"
      />
      <Story />
      <Menu />
      <Reviews />
      <InfoSection />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
