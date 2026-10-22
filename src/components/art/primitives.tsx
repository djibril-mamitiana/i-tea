/**
 * Briques d'illustration originales de I Tea : perles, fruits, feuilles, glaçons, éclaboussures.
 * Chaque brique est dessinée autour de (0, 0) pour se placer avec un simple `transform`.
 * Ce sont des illustrations de démonstration : elles sont remplacées par de vraies photos
 * dès qu'un produit (ou `site.media`) en fournit une.
 */

export const INK = "#302019";
export const CREAM = "#FFF8EF";

/** Mélange deux couleurs hexadécimales (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const to = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`;
}

export const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);
export const darken = (hex: string, t: number) => mix(hex, "#1c0f0a", t);

/** Dégradé partagé par toutes les perles d'un même SVG. À placer une fois dans <defs>. */
export function PearlDefs({ uid }: { uid: string }) {
  return (
    <radialGradient id={`pearl-${uid}`} cx="35%" cy="30%" r="80%">
      <stop offset="0" stopColor="#6b4630" />
      <stop offset="0.45" stopColor="#3a2216" />
      <stop offset="1" stopColor="#1d100a" />
    </radialGradient>
  );
}

export function Pearl({ x, y, r = 8, uid }: { x: number; y: number; r?: number; uid: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={`url(#pearl-${uid})`} />
      <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.32} ry={r * 0.2} fill="#fff" opacity={0.5} transform={`rotate(-30 ${x} ${y})`} />
      <circle cx={x + r * 0.35} cy={y + r * 0.4} r={r * 0.14} fill="#fff" opacity={0.12} />
    </g>
  );
}

/** Tas de perles de tapioca (hauteur ~ 3 rangs), posé autour de (cx, baseY). */
export function PearlPile({ cx, baseY, width = 56, uid }: { cx: number; baseY: number; width?: number; uid: string }) {
  const rows = [
    { y: baseY, count: 5, r: 6.4, dx: 0 },
    { y: baseY - 9.5, count: 4, r: 6.2, dx: 5.5 },
    { y: baseY - 18.5, count: 3, r: 6, dx: 0 },
    { y: baseY - 27, count: 2, r: 5.8, dx: 4 },
  ];
  return (
    <g>
      {rows.flatMap(({ y, count, r, dx }, ri) =>
        Array.from({ length: count }, (_, i) => {
          const step = (width - 12) / 4;
          const x = cx - ((count - 1) * step) / 2 + i * step + dx * (ri % 2 ? 0.4 : -0.2);
          const jitter = ((i * 7 + ri * 3) % 5) - 2;
          return <Pearl key={`${ri}-${i}`} x={x + jitter * 0.5} y={y + (jitter % 2)} r={r + ((i + ri) % 3) * 0.3} uid={uid} />;
        }),
      )}
    </g>
  );
}

export function IceCube({ size = 30, rotate = 0 }: { size?: number; rotate?: number }) {
  const h = size / 2;
  return (
    <g transform={`rotate(${rotate})`}>
      <rect x={-h} y={-h} width={size} height={size} rx={size * 0.26} fill="#fff" opacity={0.3} stroke="#fff" strokeOpacity={0.85} strokeWidth={1.4} />
      <path d={`M${-h * 0.6} ${-h * 0.35} L${-h * 0.15} ${-h * 0.7}`} stroke="#fff" strokeWidth={size * 0.09} strokeLinecap="round" opacity={0.9} />
      <rect x={h * 0.25} y={h * 0.2} width={h * 0.4} height={h * 0.4} rx={2} fill="#fff" opacity={0.22} />
    </g>
  );
}

export function Strawberry({ r = 20 }: { r?: number }) {
  const s = r / 20;
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 22 C-26 8 -22 -14 -8 -16 C-3 -17 0 -14 0 -14 C0 -14 3 -17 8 -16 C22 -14 26 8 0 22Z" fill="#E1384F" />
      <path d="M-14 -2 C-14 -10 -8 -14 -3 -14 C-9 -8 -12 4 -2 17 C-9 12 -14 6 -14 -2Z" fill="#F0677A" opacity={0.7} />
      {[[-9, -2], [0, -4], [9, -2], [-5, 5], [5, 5], [0, 12], [-11, 7], [11, 7]].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx={1.1} ry={1.9} fill="#FFD9A0" />
      ))}
      <path d="M-10 -16 L-5 -23 L-1 -15 L3 -24 L6 -15 L11 -21 L9 -13Z" fill="#4F9B4E" />
    </g>
  );
}

export function StrawberryHalf({ r = 20 }: { r?: number }) {
  const s = r / 20;
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 22 C-26 8 -22 -14 -8 -16 C-3 -17 0 -14 0 -14 C0 -14 3 -17 8 -16 C22 -14 26 8 0 22Z" fill="#E1384F" />
      <path d="M0 17 C-18 6 -15 -9 -6 -11 C-2 -11.5 0 -9 0 -9 C0 -9 2 -11.5 6 -11 C15 -9 18 6 0 17Z" fill="#F7A3AE" />
      <path d="M0 -7 C-4 -1 -3 7 0 13 C3 7 4 -1 0 -7Z" fill="#FDE4E6" />
      {[[-8, -3], [8, -3], [-6, 5], [6, 5]].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx={0.9} ry={1.6} fill="#FFF3EE" />
      ))}
      <path d="M-10 -16 L-5 -23 L-1 -15 L3 -24 L6 -15 L11 -21 L9 -13Z" fill="#4F9B4E" />
    </g>
  );
}

export function OrangeSlice({ r = 20, fruit = "orange" }: { r?: number; fruit?: "orange" | "lemon" | "lime" }) {
  const palette = {
    orange: { rind: "#F28C28", flesh: "#FFB347", light: "#FFD08A" },
    lemon: { rind: "#F2C318", flesh: "#FFE45C", light: "#FFF1A0" },
    lime: { rind: "#5E9B3A", flesh: "#B7DC6A", light: "#DCF0A0" },
  }[fruit];
  const s = r / 20;
  return (
    <g transform={`scale(${s})`}>
      <circle r={20} fill={palette.rind} />
      <circle r={17.2} fill="#FFF6E2" />
      <circle r={15.2} fill={palette.flesh} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45})`}>
          <path d="M0 -1.5 L-4.2 -13.6 Q0 -15.4 4.2 -13.6Z" fill={palette.light} opacity={0.75} />
          <line x1={0} y1={-1} x2={0} y2={-15.2} stroke="#FFF6E2" strokeWidth={1.1} />
        </g>
      ))}
      <circle r={1.6} fill="#FFF6E2" />
    </g>
  );
}

export function PeachHalf({ r = 22 }: { r?: number }) {
  const s = r / 22;
  return (
    <g transform={`scale(${s})`}>
      <circle r={22} fill="#F58F6B" />
      <path d="M-14 -12 C-6 -22 12 -20 18 -6 C14 -14 2 -18 -14 -12Z" fill="#FFC9A0" opacity={0.85} />
      <circle cx={-2} cy={2} r={15.5} fill="#FFC27A" />
      <circle cx={-2} cy={2} r={15.5} fill="none" stroke="#F58F6B" strokeWidth={2} opacity={0.5} />
      <ellipse cx={-1} cy={3} rx={6.2} ry={7.6} fill="#B76A3C" />
      <ellipse cx={-3} cy={0.5} rx={2.2} ry={3} fill="#D9966A" opacity={0.8} />
      <path d="M2 -21 C8 -23 12 -20 12 -20" stroke="#4F9B4E" strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Lychee({ r = 17 }: { r?: number }) {
  const s = r / 17;
  return (
    <g transform={`scale(${s})`}>
      <circle r={17} fill="#D9667A" />
      {[[-8, -6], [3, -9], [9, -1], [-4, 3], [6, 8], [-10, 6], [0, 11], [11, 7]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={1.4} fill="#B94A60" />
      ))}
      <path d="M-12 -9 C-8 -15 2 -17 8 -13" stroke="#F0A0B0" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.8} />
      {/* chair apparente, légèrement décalée */}
      <path d="M2 -4 C10 -6 18 2 14 11 C9 18 -2 16 -4 9 C-6 3 -2 -2 2 -4Z" fill="#FFF3F0" />
      <ellipse cx={6} cy={5} rx={5} ry={6} fill="#6B3E22" />
      <ellipse cx={4.2} cy={3} rx={1.6} ry={2.2} fill="#A8683F" opacity={0.8} />
    </g>
  );
}

export function Leaf({ length = 40, color = "#78966A" }: { length?: number; color?: string }) {
  const s = length / 40;
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 0 C-16 -6 -18 -26 0 -40 C18 -26 16 -6 0 0Z" fill={color} />
      <path d="M0 0 C-6 -4 -9 -14 0 -34" fill={darkenFill(color)} opacity={0.35} />
      <path d="M0 -2 L0 -34" stroke={lighten(color, 0.45)} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M0 -12 L-7 -19 M0 -19 L7 -26 M0 -25 L-5 -30" stroke={lighten(color, 0.45)} strokeWidth={1} strokeLinecap="round" opacity={0.8} />
    </g>
  );
}

function darkenFill(hex: string) {
  return darken(hex, 0.35);
}

/** Éclaboussure de lait : forme organique + gouttes. */
export function MilkSplash({ w = 160, color = "#FFFDF8" }: { w?: number; color?: string }) {
  const s = w / 160;
  return (
    <g transform={`scale(${s})`}>
      <path d="M-70 30 C-82 6 -62 -8 -52 -20 C-46 -34 -30 -30 -22 -44 C-14 -58 6 -52 10 -38 C20 -48 38 -40 40 -26 C54 -28 66 -14 62 0 C78 6 78 26 62 32 C56 46 38 46 28 40 C16 52 -6 50 -14 40 C-30 50 -52 46 -56 36 C-62 40 -68 36 -70 30Z" fill={color} />
      <circle cx={-84} cy={-22} r={6} fill={color} />
      <circle cx={84} cy={-30} r={5} fill={color} />
      <circle cx={-68} cy={-48} r={3.6} fill={color} />
      <circle cx={70} cy={-52} r={3} fill={color} />
      <circle cx={0} cy={-72} r={4.4} fill={color} />
    </g>
  );
}

export function Sparkle({ size = 14, color = CREAM }: { size?: number; color?: string }) {
  const s = size / 14;
  return <path d="M0 -14 C1 -5 5 -1 14 0 C5 1 1 5 0 14 C-1 5 -5 1 -14 0 C-5 -1 -1 -5 0 -14Z" fill={color} transform={`scale(${s})`} />;
}
