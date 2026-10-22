import { site } from "../config/site.ts";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const dayName = (day: number) => DAYS[day];

/** Lundi → dimanche, pour l'affichage. */
export function weekHours() {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const h = site.hours.find((x) => x.day === day);
    return { day, name: DAYS[day], open: h?.open ?? null, close: h?.close ?? null };
  });
}

/** « Lun–Jeu : 10h – 21h · Ven–Sam : 10h – 22h · Dim : 12h – 20h » */
export function hoursSummary(): string {
  const short = (name: string) => name.slice(0, 3);
  const groups: { from: string; to: string; label: string }[] = [];
  for (const h of weekHours()) {
    const label = h.open && h.close ? `${prettyTime(h.open)} – ${prettyTime(h.close)}` : "Fermé";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.to = short(h.name);
    else groups.push({ from: short(h.name), to: short(h.name), label });
  }
  if (groups.length === 1 && groups[0].label !== "Fermé") return `Tous les jours : ${groups[0].label}`;
  return groups.map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} : ${g.label}`).join(" · ");
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const prettyTime = (hhmm: string) => hhmm.replace(":00", "h").replace(":", "h");

/** Heure locale du restaurant (fuseau défini dans la config). */
function localParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day: dayIndex, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type OpenStatus = { open: true; until: string } | { open: false; next: string | null };

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { day, minutes } = localParts(now);
  const today = site.hours.find((h) => h.day === day);

  if (today?.open && today.close && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, until: prettyTime(today.close) };
  }
  if (today?.open && minutes < toMinutes(today.open)) {
    return { open: false, next: `Ouvre à ${prettyTime(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = site.hours.find((x) => x.day === d);
    if (h?.open) return { open: false, next: `Ouvre ${i === 1 ? "demain" : dayName(d).toLowerCase()} à ${prettyTime(h.open)}` };
  }
  return { open: false, next: null };
}
