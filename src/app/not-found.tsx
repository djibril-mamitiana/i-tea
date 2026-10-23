import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <>
      <header className="border-b border-line/80 bg-cream">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-28 text-center">
        <p className="font-display text-7xl text-accent">404</p>
        <h1 className="display-lg">Page introuvable</h1>
        <p className="text-muted">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
        <Link href="/#carte" className="btn btn-accent btn-lg mt-2">
          Retour à la carte
        </Link>
      </main>
    </>
  );
}
