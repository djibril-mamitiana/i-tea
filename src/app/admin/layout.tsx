import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin | I Tea" },
  robots: { index: false, follow: false },
};

/** Espace réservé au restaurant : aucun habillage du site public, jamais indexé. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-sand">{children}</div>;
}
