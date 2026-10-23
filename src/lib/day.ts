/** Début de la journée (minuit) dans un fuseau horaire, en tenant compte de l'heure d'été. */

const wallClock = (date: Date, timeZone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
};

/** Décalage du fuseau par rapport à UTC (en ms) à cet instant. */
const offsetMs = (date: Date, timeZone: string) => wallClock(date, timeZone) - Math.floor(date.getTime() / 1000) * 1000;

export function startOfDay(now: Date, timeZone: string): Date {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  const midnightUtc = Date.UTC(y, m - 1, d);
  const start = midnightUtc - offsetMs(new Date(midnightUtc), timeZone);
  // Le décalage peut changer entre minuit UTC et minuit local (changement d'heure) : on recalcule une fois.
  return new Date(midnightUtc - offsetMs(new Date(start), timeZone));
}
