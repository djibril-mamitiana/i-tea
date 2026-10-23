import { useId } from "react";
import type { ProductArt as Art } from "@/lib/types";
import { darken, INK, Leaf, lighten } from "./primitives";

/**
 * Illustrations vectorielles originales des plats (repère 200 × 240), dans le style des gobelets :
 * bols, rouleaux, taiyaki, canettes, sandwichs. Ce sont des illustrations génériques, pas des photos
 * des plats du restaurant : `image` sur un produit les remplace par une vraie photo.
 */

function Shadow({ rx = 60 }: { rx?: number }) {
  return <ellipse cx={100} cy={233} rx={rx} ry={6} fill={INK} opacity={0.14} />;
}

/* ---------- Bols : phở, nouilles, riz, bibimbap, salade ---------- */

function BowlContent({ variant, color }: { variant: NonNullable<Art["variant"]>; color: string }) {
  switch (variant) {
    case "soup":
      return (
        <g>
          <ellipse cx={100} cy={140} rx={72} ry={12} fill={color} />
          <path d="M46 140 C50 106 150 106 154 140Z" fill="#F7E6BE" />
          <path d="M58 134 C70 118 82 130 94 116 S122 126 134 114" stroke="#E4C88C" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M66 140 C78 126 90 136 102 124 S128 132 142 122" stroke="#E4C88C" strokeWidth={3} fill="none" strokeLinecap="round" />
          {[[78, 120, -12], [106, 114, 8], [130, 124, 18]].map(([x, y, r]) => (
            <ellipse key={x} cx={x} cy={y} rx={16} ry={8} transform={`rotate(${r} ${x} ${y})`} fill="#C9503E" stroke="#A33A2B" strokeWidth={1.6} />
          ))}
          <g transform="translate(92 112) rotate(-20)">
            <Leaf length={30} color="#5FA568" />
          </g>
          <g transform="translate(116 108) rotate(24)">
            <Leaf length={26} color="#7BC27F" />
          </g>
          <g transform="translate(146 116)">
            <path d="M-16 0 A16 16 0 0 1 16 0Z" fill="#B7DC6A" stroke="#5E9B3A" strokeWidth={2} />
            <path d="M-10 -1 A10 10 0 0 1 10 -1Z" fill="#DCF0A0" />
          </g>
        </g>
      );
    case "noodles":
      return (
        <g>
          <ellipse cx={100} cy={140} rx={72} ry={12} fill={darken(color, 0.12)} />
          <path d="M44 140 C48 100 152 100 156 140Z" fill={color} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${52 + i * 3} ${136 - i * 7} c10 -14 20 8 30 -4 s20 12 32 -2 s18 8 ${28 - i * 3} -2`}
              stroke={darken(color, 0.22)}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {[[72, 122], [112, 110], [138, 124], [94, 130]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={4.5} fill="#5FA568" />
          ))}
          <ellipse cx={126} cy={112} rx={7} ry={4} fill="#E8453C" transform="rotate(-20 126 112)" />
        </g>
      );
    case "rice":
      return (
        <g>
          <ellipse cx={100} cy={140} rx={72} ry={12} fill="#EFE2CC" />
          <path d="M46 140 C50 98 150 98 154 140Z" fill="#FFFDF8" />
          <path d="M68 122 Q76 106 96 104" stroke="#EFE2CC" strokeWidth={5} strokeLinecap="round" fill="none" />
          {[[84, 120, -14], [116, 116, 10], [100, 106, 2]].map(([x, y, r]) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
              <rect x={-19} y={-8} width={38} height={16} rx={7} fill={color} stroke={darken(color, 0.2)} strokeWidth={1.6} />
              <path d="M-12 -2 H12 M-10 3 H10" stroke={darken(color, 0.25)} strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
            </g>
          ))}
          <g transform="translate(136 108) rotate(30)">
            <Leaf length={26} color="#5FA568" />
          </g>
        </g>
      );
    case "bibimbap":
      return (
        <g>
          <ellipse cx={100} cy={140} rx={72} ry={12} fill="#EFE2CC" />
          <path d="M46 140 C50 100 150 100 154 140Z" fill="#FFF4E2" />
          <ellipse cx={72} cy={124} rx={16} ry={9} fill="#F08A24" />
          <ellipse cx={92} cy={112} rx={15} ry={8} fill="#4E9B4E" />
          <ellipse cx={128} cy={118} rx={16} ry={9} fill="#8A4B2D" />
          <ellipse cx={80} cy={134} rx={14} ry={6} fill="#D9433A" />
          <ellipse cx={126} cy={134} rx={15} ry={6} fill="#6B4A8A" opacity={0.85} />
          <circle cx={103} cy={125} r={15} fill="#FFFDF8" stroke="#EFE2CC" strokeWidth={1.5} />
          <circle cx={103} cy={125} r={6.5} fill="#F2B01E" />
          <circle cx={101} cy={123} r={2} fill="#fff" opacity={0.7} />
        </g>
      );
    case "salad":
      return (
        <g>
          <ellipse cx={100} cy={140} rx={72} ry={12} fill="#CFE3B0" />
          {[[62, 132, -50, "#6FB35F"], [86, 126, -15, "#8CCB74"], [114, 126, 18, "#5FA568"], [140, 132, 52, "#7BC27F"], [100, 118, 0, "#9ED68A"]].map(([x, y, r, c]) => (
            <g key={String(x)} transform={`translate(${x} ${y}) rotate(${r})`}>
              <Leaf length={46} color={String(c)} />
            </g>
          ))}
          {[[80, 118], [124, 114]].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r={10} fill="#E1384F" />
              <circle cx={x - 3} cy={y - 3} r={3} fill="#fff" opacity={0.4} />
            </g>
          ))}
          <circle cx={102} cy={110} r={11} fill="#B7DC6A" stroke="#5E9B3A" strokeWidth={2} />
          <circle cx={102} cy={110} r={6} fill="#DCF0A0" />
        </g>
      );
  }
}

function Bowl({ art }: { art: Art }) {
  const { color, color2 = "#FFF4E2", variant = "soup" } = art;
  return (
    <g>
      <Shadow rx={66} />
      <ellipse cx={100} cy={140} rx={74} ry={12} fill={darken(color2, 0.1)} />
      <BowlContent variant={variant} color={color} />
      <path d="M26 140 Q100 162 174 140 C174 192 146 224 100 224 C54 224 26 192 26 140Z" fill={color2} stroke={INK} strokeOpacity={0.14} strokeWidth={2} />
      <path d="M26 140 Q100 162 174 140" stroke={INK} strokeOpacity={0.12} strokeWidth={2} fill="none" />
      <path d="M40 162 C44 186 58 204 80 214" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
      <path d="M44 176 H156" stroke={lighten(color, 0.3)} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
      <ellipse cx={100} cy={226} rx={32} ry={5} fill={darken(color2, 0.14)} />
      {variant === "soup" && (
        <g stroke="#8A5A36" strokeWidth={4.5} strokeLinecap="round">
          <line x1={112} y1={58} x2={172} y2={132} />
          <line x1={124} y1={54} x2={184} y2={122} />
        </g>
      )}
    </g>
  );
}

/* ---------- Rouleaux (nems, rouleaux de printemps, crêpes) ---------- */

function Rolls({ art }: { art: Art }) {
  const { color, color2 = "#B3261E" } = art;
  const rolls: [number, number, number][] = [[92, 196, -6], [98, 170, 5], [90, 146, -3]];
  return (
    <g>
      <Shadow rx={84} />
      <ellipse cx={100} cy={206} rx={90} ry={24} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      <ellipse cx={100} cy={204} rx={70} ry={16} fill={INK} opacity={0.05} />
      <g transform="translate(34 172) rotate(-28)">
        <Leaf length={58} color="#6FB35F" />
      </g>
      {rolls.map(([x, y, r]) => (
        <g key={y} transform={`translate(${x} ${y}) rotate(${r})`}>
          <rect x={-48} y={-15} width={96} height={30} rx={15} fill={color} stroke={darken(color, 0.25)} strokeWidth={2} />
          <ellipse cx={44} cy={0} rx={6} ry={13} fill={lighten(color, 0.35)} stroke={darken(color, 0.25)} strokeWidth={1.6} />
          <path d="M-34 -8 L-24 8 M-18 -9 L-8 9 M-2 -9 L8 9 M14 -9 L24 8" stroke={darken(color, 0.2)} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
          <path d="M-40 -9 Q0 -14 40 -9" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.45} />
        </g>
      ))}
      <ellipse cx={156} cy={212} rx={18} ry={7} fill="#fff" stroke={INK} strokeOpacity={0.15} strokeWidth={1.6} />
      <ellipse cx={156} cy={210} rx={13} ry={4.4} fill={color2} />
    </g>
  );
}

/* ---------- Taiyaki : gaufre en forme de poisson ---------- */

function Taiyaki({ art, uid }: { art: Art; uid: string }) {
  const { color, color2 = "#9B5B34" } = art;
  const body = "M52 150 C52 112 104 98 142 116 C160 124 172 138 172 150 C172 162 160 176 142 184 C104 202 52 188 52 150Z";
  return (
    <g>
      <defs>
        <clipPath id={`taiyaki-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <Shadow rx={78} />
      <ellipse cx={100} cy={216} rx={86} ry={20} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      <path d="M56 150 L20 116 Q28 150 20 186Z" fill={color} stroke={darken(color, 0.28)} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M112 112 L124 84 L140 118Z" fill={color} stroke={darken(color, 0.28)} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={body} fill={color} />
      <g clipPath={`url(#taiyaki-${uid})`} stroke={darken(color, 0.22)} strokeWidth={2.4} opacity={0.6}>
        {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1={112 + i * 18 - 50} y1={90} x2={112 + i * 18 + 50} y2={210} />
            <line x1={112 + i * 18 + 50} y1={90} x2={112 + i * 18 - 50} y2={210} />
          </g>
        ))}
        <path d="M60 134 Q112 108 168 134" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.5} />
      </g>
      <path d={body} fill="none" stroke={darken(color, 0.28)} strokeWidth={2.4} />
      <path d="M92 124 Q84 150 92 178" stroke={darken(color, 0.3)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      <circle cx={146} cy={140} r={6.5} fill={INK} />
      <circle cx={144} cy={138} r={2} fill="#fff" />
      <path d="M166 152 Q160 158 154 156" stroke={color2} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

/* ---------- Canettes ---------- */

function Can({ art }: { art: Art }) {
  const { color, color2 = "#fff" } = art;
  return (
    <g>
      <Shadow rx={46} />
      <path d="M64 70 Q64 62 74 60 H126 Q136 62 136 70 L140 214 Q140 226 128 228 H72 Q60 226 60 214Z" fill={color} stroke={darken(color, 0.3)} strokeWidth={2} />
      <path d="M60 76 H140 V92 H60Z" fill="#E8ECEF" opacity={0.9} />
      <ellipse cx={100} cy={64} rx={36} ry={7} fill="#D5DADF" stroke={INK} strokeOpacity={0.2} strokeWidth={1.6} />
      <ellipse cx={100} cy={63} rx={26} ry={4.4} fill="#EEF1F3" />
      <rect x={90} y={58.6} width={20} height={5.6} rx={2.8} fill="#BFC6CC" />
      <path d="M60 118 C84 104 116 134 140 120 V160 C116 174 84 144 60 158Z" fill={color2} opacity={0.92} />
      <circle cx={100} cy={144} r={13} fill={color} opacity={0.9} />
      <path d="M72 100 L78 100 Q76 160 78 214 L70 214 Q68 160 72 100Z" fill="#fff" opacity={0.4} />
      <path d="M124 100 L128 100 Q127 160 129 214 L126 214 Q124 160 124 100Z" fill="#fff" opacity={0.22} />
      <path d="M60 214 Q100 226 140 214 V222 Q100 234 60 222Z" fill="#E8ECEF" opacity={0.85} />
    </g>
  );
}

/* ---------- Sandwich (baguette garnie) ---------- */

function Sandwich({ art }: { art: Art }) {
  const { color, color2 = "#B5733A" } = art;
  return (
    <g>
      <Shadow rx={78} />
      <path d="M22 172 Q22 154 44 154 H156 Q178 154 178 172 L172 200 Q170 210 158 210 H42 Q30 210 28 200Z" fill={lighten(color, 0.12)} stroke={darken(color, 0.25)} strokeWidth={2} />
      <path d="M30 168 Q100 180 170 168" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.4} />
      <path d="M26 156 q10 -14 22 -2 q10 12 22 -2 q12 -12 24 0 q12 12 24 -2 q12 -12 24 0 q10 10 24 0 q6 -4 8 6 L170 170 H30Z" fill="#6FB35F" stroke="#4F9B4E" strokeWidth={1.8} strokeLinejoin="round" />
      {[[48, 154], [76, 156], [104, 154], [132, 156]].map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx={13} ry={4.5} fill="#F08A24" stroke="#D9731A" strokeWidth={1.2} />
      ))}
      {[[62, 148], [118, 146]].map(([x, y]) => (
        <path key={x} d={`M${x - 16} ${y} q16 -14 32 0 q-16 8 -32 0Z`} fill={color2} stroke={darken(color2, 0.25)} strokeWidth={1.6} />
      ))}
      <path d="M18 148 Q18 108 60 104 H140 Q182 108 182 148 Q100 138 18 148Z" fill={color} stroke={darken(color, 0.25)} strokeWidth={2} />
      <path d="M52 124 L62 112 M82 124 L92 110 M112 124 L122 110 M142 124 L152 112" stroke={darken(color, 0.22)} strokeWidth={3.5} strokeLinecap="round" opacity={0.55} />
      <path d="M36 128 Q50 112 76 108" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={0.5} />
    </g>
  );
}

/** Dessine l'illustration d'un plat selon `art.kind` ; renvoie null pour les autres types. */
export function FoodArt({ art }: { art: Art }) {
  const uid = useId().replace(/:/g, "");
  switch (art.kind) {
    case "bowl": return <Bowl art={art} />;
    case "rolls": return <Rolls art={art} />;
    case "taiyaki": return <Taiyaki art={art} uid={uid} />;
    case "can": return <Can art={art} />;
    case "sandwich": return <Sandwich art={art} />;
    default: return null;
  }
}
