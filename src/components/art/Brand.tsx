import { useId } from "react";

/**
 * Motifs de la marque, dessinés d'après le logo d'I Tea : fleurs de cerisier roses, branche, paire de feuilles
 * vert forêt. Purement décoratifs (aria-hidden) ; la couleur et la taille se règlent depuis l'appelant.
 */

const PETAL = "M50 50 C33 43 22 21 34 9 C40 3 47 6 50 13 C53 6 60 3 66 9 C78 21 67 43 50 50Z";
const STAMENS = [0, 51, 103, 154, 206, 257, 309].map((a) => ({
  x: 50 + 15 * Math.sin((a * Math.PI) / 180),
  y: 50 - 15 * Math.cos((a * Math.PI) / 180),
}));

/** Une fleur de cerisier (cinq pétales échancrés, étamines), centrée sur (50, 50) dans un repère de 100 × 100. */
function FlowerShape({ gradient }: { gradient: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a} 50 50)`} fill={`url(#${gradient})`} stroke="#e8809f" strokeOpacity={0.55} strokeWidth={0.9} />
      ))}
      <circle cx={50} cy={50} r={6} fill="#f2a5b9" />
      <g stroke="#c43a63" strokeWidth={1} strokeLinecap="round">
        {STAMENS.map((p, i) => (
          <line key={i} x1={50} y1={50} x2={p.x} y2={p.y} />
        ))}
      </g>
      {STAMENS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.9} fill="#b51f46" />
      ))}
    </g>
  );
}

function FlowerGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="50%" cy="50%" r="55%">
      <stop offset="0" stopColor="#ee7d9f" />
      <stop offset="0.55" stopColor="#f7b6c7" />
      <stop offset="1" stopColor="#fde3ea" />
    </radialGradient>
  );
}

/** Une fleur de cerisier isolée. */
export function Sakura({ className = "", size = 48, rotate = 0 }: { className?: string; size?: number; rotate?: number }) {
  const gradient = `sakura-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true" focusable="false">
      <defs>
        <FlowerGradient id={gradient} />
      </defs>
      <FlowerShape gradient={gradient} />
    </svg>
  );
}

/** Une branche fleurie qui part du bas-gauche vers le haut-droit (`flip` pour l'autre sens). */
export function SakuraBranch({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  const gradient = `branch-${useId().replace(/:/g, "")}`;
  const flowers: { x: number; y: number; s: number; r: number }[] = [
    { x: 150, y: 104, s: 0.46, r: 12 },
    { x: 124, y: 70, s: 0.52, r: -18 },
    { x: 246, y: 92, s: 0.42, r: 30 },
    { x: 272, y: 36, s: 0.48, r: -8 },
    { x: 58, y: 146, s: 0.34, r: 20 },
    { x: 206, y: 70, s: 0.3, r: 50 },
  ];
  const buds: [number, number, number][] = [[100, 126, -30], [224, 104, 20], [186, 58, -10]];
  const leaves: [number, number, number][] = [[84, 136, -40], [168, 92, 20], [232, 66, -25], [284, 22, 30]];
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <FlowerGradient id={gradient} />
      </defs>
      <g fill="none" stroke="#5a3b2e" strokeLinecap="round">
        <path d="M6 168 C70 146 104 146 150 110 S240 76 312 26" strokeWidth={4.5} />
        <path d="M104 144 C118 126 126 106 124 82" strokeWidth={2.6} />
        <path d="M190 90 C206 102 224 104 246 98" strokeWidth={2.6} />
        <path d="M232 66 C240 48 256 40 272 42" strokeWidth={2.4} />
      </g>
      {leaves.map(([x, y, r], i) => (
        <path key={i} d="M0 0 C10 -6 22 -6 30 0 C22 6 10 6 0 0Z" transform={`translate(${x} ${y}) rotate(${r})`} fill="#3f6e39" />
      ))}
      {buds.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <ellipse cx={0} cy={-7} rx={5} ry={8} fill="#f08aa7" />
          <ellipse cx={0} cy={1} rx={4} ry={3} fill="#8c4a3a" />
        </g>
      ))}
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x - 50 * f.s} ${f.y - 50 * f.s}) rotate(${f.r} ${50 * f.s} ${50 * f.s}) scale(${f.s})`}>
          <FlowerShape gradient={gradient} />
        </g>
      ))}
    </svg>
  );
}

/** Une paire de feuilles sur une tige courbe, comme celles qui encadrent le logo. */
export function LeafPair({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden="true" focusable="false">
      <path d="M30 118 C26 90 30 50 40 6" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <g fill={color}>
        <path d="M29 96 C8 92 2 72 5 56 C22 60 33 76 29 96Z" />
        <path d="M31 70 C52 64 56 44 52 30 C36 34 27 50 31 70Z" />
        <path d="M33 40 C20 34 17 20 20 10 C31 14 37 26 33 40Z" />
      </g>
    </svg>
  );
}
