import type { ProductArt as Art } from "@/lib/types";
import { CREAM, darken, IceCube, INK, Leaf, lighten, OrangeSlice, PearlDefs, PearlPile, Strawberry } from "./primitives";

/**
 * Gobelet de bubble tea I Tea (repère 200 × 240). Liquide dégradé, perles brillantes,
 * glaçons, paille rayée rose, étiquette de marque, gouttes de condensation.
 */

const BODY = "M52 80 L148 80 L138 214 Q137 226 126 226 L74 226 Q63 226 62 214 Z";

function Garnish({ type }: { type: NonNullable<Art["garnish"]> }) {
  if (type === "none") return null;
  if (type === "orange" || type === "lemon") {
    return (
      <g transform="translate(151 71) rotate(-14)">
        <OrangeSlice r={19} fruit={type} />
      </g>
    );
  }
  if (type === "strawberry") {
    return (
      <g transform="translate(148 66) rotate(16)">
        <Strawberry r={17} />
      </g>
    );
  }
  // mint
  return (
    <g transform="translate(106 52)">
      <g transform="rotate(-28)">
        <Leaf length={38} color="#5FA568" />
      </g>
      <g transform="rotate(24) translate(4 0)">
        <Leaf length={34} color="#7BC27F" />
      </g>
    </g>
  );
}

function Streaks({ color }: { color: string }) {
  const stroke = darken(color, 0.12);
  return (
    <g fill="none" stroke={stroke} strokeLinecap="round" opacity={0.9}>
      <path d="M61 106 C58 128 66 150 63 176 C62 192 67 206 69 218" strokeWidth={7} />
      <path d="M77 103 C80 126 73 148 78 178 C79 190 77 200 78 210" strokeWidth={4.5} opacity={0.8} />
      <path d="M97 103 C100 122 94 146 98 166" strokeWidth={3.5} opacity={0.7} />
      <path d="M118 104 C116 130 123 152 118 184" strokeWidth={5} opacity={0.85} />
      <path d="M139 106 C141 132 134 158 137 190 C138 202 134 212 133 220" strokeWidth={7} />
    </g>
  );
}

export function Cup({ art, uid, label = true }: { art: Art; uid: string; label?: boolean }) {
  const { color, color2 = color, topping = "none", garnish = "none", streaks = false, foam = "#FFF4E4" } = art;
  const hasPearls = topping === "pearls";

  return (
    <g>
      <defs>
        <clipPath id={`clip-${uid}`}>
          <path d={BODY} />
        </clipPath>
        <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(color, 0.18)} />
          <stop offset="0.42" stopColor={color} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
        <linearGradient id={`plastic-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.62" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.55" stopColor={INK} stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`dome-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        <pattern id={`straw-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(62)">
          <rect width="14" height="14" fill="#FDECEF" />
          <rect width="7" height="14" fill="#F1A6B6" />
        </pattern>
        <PearlDefs uid={uid} />
      </defs>

      {/* ombre au sol */}
      <ellipse cx={100} cy={233} rx={52} ry={6.5} fill={INK} opacity={0.17} />

      {/* paroi du gobelet */}
      <path d={BODY} fill="#fff" opacity={0.3} />

      <g clipPath={`url(#clip-${uid})`}>
        <rect x={40} y={102} width={120} height={130} fill={`url(#liquid-${uid})`} />
        {streaks && <Streaks color={color2} />}
        {/* surface du liquide */}
        <ellipse cx={100} cy={102} rx={50} ry={5.5} fill={lighten(color, 0.4)} opacity={0.7} />
        {topping === "foam" && (
          <g>
            <path d="M40 96 Q60 88 80 96 T120 96 T160 96 L160 118 Q140 126 120 118 T80 118 T40 118Z" fill={foam} />
            <path d="M40 96 Q60 88 80 96 T120 96 T160 96 L160 100 L40 100Z" fill="#fff" opacity={0.55} />
          </g>
        )}
        <g transform="translate(84 130)">
          <IceCube size={30} rotate={-14} />
        </g>
        <g transform="translate(118 123)">
          <IceCube size={28} rotate={11} />
        </g>
        <g transform="translate(101 152)">
          <IceCube size={26} rotate={5} />
        </g>
        {hasPearls && <PearlPile cx={100} baseY={216} width={58} uid={uid} />}
        {topping === "jelly" && (
          <g>
            {[[72, 208, -8], [89, 211, 6], [106, 208, -4], [121, 210, 9], [81, 194, 5], [98, 197, -7], [113, 195, 4]].map(([x, y, r]) => (
              <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
                <rect x={x - 7.5} y={y - 7.5} width={15} height={15} rx={3.8} fill={lighten(color2, 0.15)} stroke="#fff" strokeOpacity={0.7} />
                <rect x={x - 5} y={y - 5} width={4.2} height={4.2} rx={1.5} fill="#fff" opacity={0.5} />
              </g>
            ))}
          </g>
        )}
        <rect x={40} y={80} width={120} height={150} fill={`url(#shade-${uid})`} />
      </g>

      {/* contour + reflets du plastique */}
      <path d={BODY} fill={`url(#plastic-${uid})`} />
      <path d={BODY} fill="none" stroke={INK} strokeOpacity={0.2} strokeWidth={2} />
      <path d="M60 94 L70 94 Q73 150 75 206 L68 206 Q66 150 60 94Z" fill="#fff" opacity={0.5} />
      <path d="M140 100 L143 100 Q141 150 137 204 L135 204 Q139 150 140 100Z" fill="#fff" opacity={0.32} />

      {/* condensation */}
      {[[68, 118, 1.8], [72, 130, 1.2], [131, 140, 1.6], [128, 156, 1.1], [70, 168, 1.4]].map(([x, y, r]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 1.4} fill="#fff" opacity={0.7} />
      ))}

      {/* paille */}
      <g>
        <path d="M108 3 L120 6 L106 172 L95 169Z" fill={`url(#straw-${uid})`} />
        <path d="M108 3 L120 6 L119 12 L107.4 9Z" fill="#fff" opacity={0.5} />
        <path d="M111 7 L113.5 7.6 L100 165 L98 164.6Z" fill="#fff" opacity={0.35} />
      </g>

      {/* étiquette de marque */}
      {label && (
        <g transform="translate(100 168)">
          <circle r={15.5} fill={CREAM} stroke={INK} strokeOpacity={0.12} />
          <circle r={12.2} fill="none" stroke="#C58A50" strokeWidth={1.2} strokeDasharray="2 2.6" />
          {/* « I » dessiné (pas de dépendance à une police) */}
          <path d="M-5.2 -8 H5.2 V-5.6 H2.2 V5.6 H5.2 V8 H-5.2 V5.6 H-2.2 V-5.6 H-5.2Z" fill={INK} />
        </g>
      )}

      {/* couvercle */}
      <path d="M49 82 Q49 50 100 47 Q151 50 151 82Z" fill={`url(#dome-${uid})`} stroke={INK} strokeOpacity={0.16} strokeWidth={2} />
      <path d="M62 76 Q64 58 88 54" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.85} />
      <rect x={43} y={78} width={114} height={11} rx={5.5} fill="#FFFDF8" stroke={INK} strokeOpacity={0.16} strokeWidth={2} />
      <rect x={47} y={80.5} width={106} height={3} rx={1.5} fill="#EADCCB" opacity={0.75} />

      <Garnish type={garnish} />
    </g>
  );
}
