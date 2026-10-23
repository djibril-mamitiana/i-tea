import { useId } from "react";
import type { ProductArt as Art } from "@/lib/types";
import { Cup } from "./art/Cup";
import { FoodArt } from "./art/Food";
import { INK } from "./art/primitives";

/**
 * Illustrations vectorielles de démonstration (légères, nettes sur tous les écrans,
 * jamais « cassées »). Elles ne prétendent pas être des photos du restaurant :
 * dès qu'un produit a un champ `image`, la photo la remplace automatiquement.
 */

const PEARL = "#2a1912";

function Nuggets({ art }: { art: Art }) {
  const { color } = art;
  const blobs: [number, number, number, number][] = [
    [72, 138, 25, -10], [128, 136, 26, 12], [100, 108, 27, 4], [58, 106, 20, -20], [142, 104, 20, 18],
  ];
  return (
    <g>
      <ellipse cx={100} cy={233} rx={54} ry={6} fill={INK} opacity={0.14} />
      {blobs.map(([x, y, r, rot]) => (
        <g key={`${x}-${y}`} transform={`rotate(${rot} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.86} fill={color} stroke="#B9770E" strokeWidth={2} />
          <ellipse cx={x - r * 0.25} cy={y - r * 0.3} rx={r * 0.45} ry={r * 0.22} fill="#fff" opacity={0.35} />
          {[[-8, 6], [6, 8], [10, -4], [-2, -6], [-12, -2]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={1.7} fill="#B9770E" opacity={0.55} />
          ))}
        </g>
      ))}
      <path d="M52 148 L148 148 L136 222 Q135 232 125 232 L75 232 Q65 232 64 222Z" fill="#E5B26B" />
      <path d="M57 178 L143 178 L139 202 L61 202Z" fill="#FF6A3D" />
      <path d="M52 148 L148 148 L146 156 L54 156Z" fill="#fff" opacity={0.28} />
    </g>
  );
}

function Fries({ art }: { art: Art }) {
  const { color } = art;
  const sticks: [number, number, number][] = [
    [64, -24, 96], [78, -14, 108], [92, -5, 116], [106, 4, 112], [120, 12, 106], [134, 22, 94], [85, -9, 90], [114, 8, 88],
  ];
  return (
    <g>
      <ellipse cx={100} cy={233} rx={54} ry={6} fill={INK} opacity={0.14} />
      {sticks.map(([x, rot, h], i) => (
        <g key={x} transform={`rotate(${rot} ${x} 160)`}>
          <rect x={x - 7} y={160 - h} width={14} height={h} rx={4} fill={i % 2 ? "#E58B2B" : color} />
          <rect x={x - 4} y={160 - h + 6} width={3} height={h * 0.5} rx={1.5} fill="#fff" opacity={0.3} />
        </g>
      ))}
      <path d="M54 150 L146 150 L136 222 Q135 232 125 232 L75 232 Q65 232 64 222Z" fill="#E8453C" />
      <path d="M54 150 L146 150 L143 170 L57 170Z" fill="#fff" opacity={0.2} />
      <circle cx={100} cy={196} r={14} fill="#FFF4E2" />
      <path d="M94 196 q6 -9 12 0 q-6 9 -12 0Z" fill="#E8453C" />
    </g>
  );
}

function Gyoza({ art }: { art: Art }) {
  const { color } = art;
  const items: [number, number, number][] = [[66, 188, -12], [134, 186, 12], [100, 156, 0]];
  return (
    <g>
      <ellipse cx={100} cy={214} rx={84} ry={26} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      <ellipse cx={100} cy={210} rx={66} ry={18} fill={INK} opacity={0.06} />
      {items.map(([x, y, rot]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d="M-36 6 Q0 -44 36 6 Q0 20 -36 6Z" fill={color} stroke="#C98B3F" strokeWidth={2} />
          <path d="M-34 8 Q0 24 34 8 Q0 17 -34 8Z" fill="#C98B3F" opacity={0.65} />
          {[-20, -10, 0, 10, 20].map((px) => (
            <path key={px} d={`M${px} -16 q3 8 0 20`} stroke="#C98B3F" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      ))}
      <ellipse cx={150} cy={226} rx={14} ry={5} fill="#5A2B14" />
      <path d="M136 226 Q150 232 164 226 L162 232 Q150 238 138 232Z" fill="#5A2B14" opacity={0.8} />
    </g>
  );
}

function Bao({ art }: { art: Art }) {
  const { color, color2 = "#E7A63A" } = art;
  return (
    <g>
      <ellipse cx={100} cy={232} rx={58} ry={6} fill={INK} opacity={0.14} />
      <path d="M46 168 Q100 180 154 168 L148 206 Q100 222 52 206Z" fill={color} stroke="#E8D5B5" strokeWidth={2} />
      <path d="M44 150 Q60 140 74 150 T104 150 T134 148 T156 150 L154 172 Q100 184 46 172Z" fill={color2} />
      <path d="M50 150 q10 -10 22 0 q10 8 22 -2 q12 -8 24 2 q12 8 24 -2 q8 -4 8 4" stroke="#4BB35E" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M40 144 Q40 78 100 78 Q160 78 160 144 Q100 158 40 144Z" fill={color} stroke="#E8D5B5" strokeWidth={2} />
      <path d="M62 118 Q70 94 92 90" stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.7} />
      <path d="M100 82 q-8 14 0 28 q8 -14 0 -28" stroke="#E8D5B5" strokeWidth={2} fill="none" />
    </g>
  );
}

function Mochi({ art }: { art: Art }) {
  const { color, color2 = color } = art;
  const balls: [number, number, string][] = [[66, 190, color], [136, 190, color2], [101, 150, "#FFF4EA"]];
  return (
    <g>
      <ellipse cx={100} cy={216} rx={86} ry={24} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      {balls.map(([x, y, fill]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y + 26} rx={30} ry={5} fill={INK} opacity={0.1} />
          <path d={`M${x - 32} ${y + 12} Q${x - 34} ${y - 30} ${x} ${y - 30} Q${x + 34} ${y - 30} ${x + 32} ${y + 12} Q${x} ${y + 26} ${x - 32} ${y + 12}Z`} fill={fill} />
          <path d={`M${x - 20} ${y - 12} Q${x - 14} ${y - 22} ${x - 2} ${y - 22}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
          {[[-10, 4], [8, 8], [14, -4]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={1.4} fill="#fff" opacity={0.9} />
          ))}
        </g>
      ))}
      <g transform="translate(101 112)">
        <path d="M0 0 C-8 -8 -2 -18 0 -14 C2 -18 8 -8 0 0Z" fill="#E8344F" />
        <path d="M-3 -14 L0 -20 L3 -14" stroke="#3E9B4F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Cake({ art }: { art: Art }) {
  const { color, color2 = "#E8537A" } = art;
  return (
    <g>
      <ellipse cx={100} cy={218} rx={86} ry={22} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      <path d="M44 208 L44 150 Q44 140 56 140 L144 140 Q156 140 156 150 L156 208Z" fill={color} />
      <path d="M44 150 Q44 140 56 140 L144 140 Q156 140 156 150 L156 160 L44 160Z" fill="#fff" opacity={0.4} />
      <path d="M44 190 L156 190 L156 208 L44 208Z" fill="#9B5B34" />
      <path d="M44 190 L156 190 L156 195 L44 195Z" fill="#7A4426" />
      <path d="M44 148 Q44 138 56 138 L144 138 Q156 138 156 148 L156 156 Q150 150 146 162 Q142 172 138 158 Q132 148 126 160 Q120 176 114 158 Q106 146 98 162 Q92 172 86 156 Q78 146 72 160 Q66 170 62 156 Q58 148 44 156Z" fill={color2} />
      {[[78, 132, 11], [104, 127, 12], [128, 134, 10]].map(([x, y, r]) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill={color2} stroke="#B3294C" strokeWidth={1.5} />
          <circle cx={x - 3} cy={y - 3.5} r={r * 0.28} fill="#fff" opacity={0.5} />
        </g>
      ))}
      <path d="M101 112 l4 -6 l4 7" stroke="#3E9B4F" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Waffle({ art, uid }: { art: Art; uid: string }) {
  const { color, color2 = "#8A5A36" } = art;
  const lines = [-48, -32, -16, 0, 16, 32, 48];
  return (
    <g>
      <defs>
        <clipPath id={`waffle-${uid}`}>
          <circle cx={100} cy={160} r={64} />
        </clipPath>
      </defs>
      <ellipse cx={100} cy={226} rx={72} ry={8} fill={INK} opacity={0.14} />
      <circle cx={100} cy={160} r={70} fill="#fff" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
      <circle cx={100} cy={160} r={64} fill={color} />
      <g clipPath={`url(#waffle-${uid})`} stroke="#B9822F" strokeWidth={3} opacity={0.7}>
        {lines.map((l) => (
          <g key={l}>
            <line x1={100 + l} y1={90} x2={100 + l} y2={230} />
            <line x1={30} y1={160 + l} x2={170} y2={160 + l} />
          </g>
        ))}
      </g>
      <path d="M52 150 Q70 120 100 128 Q130 120 150 156 Q130 140 118 166 Q106 180 94 160 Q80 140 66 172 Q56 170 52 150Z" fill={color2} opacity={0.85} />
      <g fill="#fff">
        <circle cx={100} cy={146} r={20} />
        <circle cx={84} cy={152} r={14} />
        <circle cx={116} cy={152} r={14} />
        <circle cx={100} cy={132} r={12} />
      </g>
      <circle cx={95} cy={128} r={4} fill="#EFE6D6" opacity={0.7} />
      {[[62, 176], [138, 178], [76, 196], [124, 198], [100, 204]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r={5.5} fill={PEARL} />
          <circle cx={x - 1.8} cy={y - 2} r={1.5} fill="#fff" opacity={0.4} />
        </g>
      ))}
    </g>
  );
}

function Combo({ art, uid }: { art: Art; uid: string }) {
  const snack: Art = { kind: "nuggets", color: art.color2 ?? "#E7A63A", bg: art.bg };
  const cup: Art = { ...art, kind: "cup", garnish: "none" };
  return (
    <g>
      <g transform="translate(74 76) scale(0.66)">
        <Nuggets art={snack} />
      </g>
      <g transform="translate(-14 12) scale(0.84)">
        <Cup art={cup} uid={uid} />
      </g>
    </g>
  );
}

export function ArtSvg({ art, className }: { art: Art; className?: string }) {
  const uid = useId().replace(/:/g, "");
  let content;
  switch (art.kind) {
    case "cup": content = <Cup art={art} uid={uid} />; break;
    case "nuggets": content = <Nuggets art={art} />; break;
    case "fries": content = <Fries art={art} />; break;
    case "gyoza": content = <Gyoza art={art} />; break;
    case "bao": content = <Bao art={art} />; break;
    case "mochi": content = <Mochi art={art} />; break;
    case "cake": content = <Cake art={art} />; break;
    case "waffle": content = <Waffle art={art} uid={uid} />; break;
    case "combo": content = <Combo art={art} uid={uid} />; break;
    default: content = <FoodArt art={art} />;
  }
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-hidden="true" focusable="false">
      {content}
    </svg>
  );
}
