import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { MobileCartBar } from "@/components/cart/MobileCartBar";
import { ProductDialog } from "@/components/cart/ProductDialog";
import { Toast } from "@/components/cart/Toast";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/** Habillage du site public (panier, en-tête, pied de page). L'admin n'en fait pas partie. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-5 focus:py-3 focus:font-bold focus:text-cream"
      >
        Aller au contenu
      </a>
      <CartProvider>
        <DemoBanner />
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <ProductDialog />
        <CartDrawer />
        <Toast />
        <MobileCartBar />
      </CartProvider>
    </>
  );
}
