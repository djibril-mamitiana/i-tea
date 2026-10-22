import Link from "next/link";
import { site } from "@/config/site";

export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#c58a50" />
      <path d="M22.5 6.5 25 7l-2 9" stroke="#302019" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M11.5 15h17l-1.7 16.2a2.5 2.5 0 0 1-2.5 2.3h-8.6a2.5 2.5 0 0 1-2.5-2.3z" fill="#302019" />
      <path d="M12.3 21.5h15.4l-.5 4.8H12.8z" fill="#fff8ef" opacity=".9" />
      <circle cx="16.5" cy="30" r="1.9" fill="#fff8ef" />
      <circle cx="21" cy="30.6" r="1.9" fill="#fff8ef" />
      <circle cx="25" cy="29.8" r="1.9" fill="#fff8ef" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label={`${site.name} — accueil`}>
      <LogoMark />
      <span className={`font-display text-2xl font-extrabold leading-none tracking-tight ${light ? "text-cream" : "text-ink"}`}>
        <span className="text-accent">I</span> Tea
      </span>
    </Link>
  );
}
