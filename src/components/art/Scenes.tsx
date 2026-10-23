import { useId } from "react";
import type { ProductArt as Art } from "@/lib/types";
import { Cup } from "./Cup";
import { FoodArt } from "./Food";
import {
  CREAM,
  IceCube,
  INK,
  Leaf,
  Lychee,
  MilkSplash,
  OrangeSlice,
  PeachHalf,
  Pearl,
  PearlDefs,
  Sparkle,
  Strawberry,
  StrawberryHalf,
} from "./primitives";

/**
 * Compositions de la page d'accueil. Ce sont des illustrations originales de démonstration :
 * `site.media.hero` / `site.media.brand` les remplacent par une vraie photographie.
 */

const brownSugar: Art = { kind: "cup", color: "#F6E7D3", color2: "#A9693A", topping: "pearls", streaks: true, bg: "" };
const pho: Art = { kind: "bowl", variant: "soup", color: "#E8B25C", bg: "" };
const strawberryMilk: Art = { kind: "cup", color: "#FBD3DB", color2: "#E9808F", topping: "pearls", garnish: "strawberry", bg: "" };

/** Place un gobelet : pivot au centre de son pied. */
function PlacedCup({ art, uid, x, y, scale, rotate = 0 }: { art: Art; uid: string; x: number; y: number; scale: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-100 -226)`}>
      <Cup art={art} uid={uid} />
    </g>
  );
}

/** Décor flottant : le conteneur positionne, l'enfant s'anime (sans conflit de `transform`). */
function Floating({
  x,
  y,
  rotate = 0,
  dur = 9,
  delay = 0,
  dist = -10,
  children,
}: {
  x: number;
  y: number;
  rotate?: number;
  dur?: number;
  delay?: number;
  dist?: number;
  children: React.ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className="svg-float" style={{ ["--dur" as string]: `${dur}s`, ["--delay" as string]: `${delay}s`, ["--float" as string]: `${dist}px` }}>
        {children}
      </g>
    </g>
  );
}

const GROUND_PEARLS: [number, number, number][] = [
  [332, 618, 9], [430, 612, 11], [498, 596, 9], [548, 612, 13], [612, 592, 10], [660, 606, 12], [470, 626, 8],
];

export function HeroScene({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 720 640" className={className} role="img" aria-hidden="true" focusable="false">
      <defs>
        <PearlDefs uid={uid} />
      </defs>

      {/* fonds : arche rose, disque matcha, sol caramel */}
      <circle cx={140} cy={178} r={112} fill="#DDE8D3" />
      <path d="M190 626 L190 300 A190 190 0 0 1 570 300 L570 626Z" fill="#F7C3CF" />
      <path d="M214 626 L214 304 A166 166 0 0 1 546 304 L546 626Z" fill="none" stroke={CREAM} strokeOpacity={0.55} strokeWidth={3} />
      <ellipse cx={372} cy={606} rx={346} ry={34} fill="#EBCDA6" opacity={0.7} />
      <g transform="translate(380 250)" opacity={0.95}>
        <MilkSplash w={330} color="#FFFDF8" />
      </g>

      {/* bol de pho et gobelets */}
      <g transform="translate(170 604) rotate(-4) scale(1.7) translate(-100 -228)">
        <FoodArt art={pho} />
      </g>
      <PlacedCup art={strawberryMilk} uid={`${uid}c`} x={570} y={598} scale={1.7} rotate={6} />
      <PlacedCup art={brownSugar} uid={`${uid}a`} x={380} y={610} scale={2.25} />

      {/* décor flottant */}
      <Floating x={92} y={150} rotate={-14} dur={9} delay={-2}>
        <OrangeSlice r={34} />
      </Floating>
      <Floating x={640} y={140} rotate={12} dur={11} delay={-4}>
        <PeachHalf r={36} />
      </Floating>
      <Floating x={318} y={74} rotate={-8} dur={8} delay={-1} dist={-14}>
        <g opacity={0.95}>
          <IceCube size={42} rotate={14} />
        </g>
      </Floating>
      <Floating x={470} y={52} rotate={10} dur={10} delay={-5} dist={-12}>
        <IceCube size={34} rotate={-10} />
      </Floating>
      <Floating x={60} y={348} rotate={-30} dur={10} delay={-3}>
        <Leaf length={64} color="#78966A" />
      </Floating>
      <Floating x={104} y={398} rotate={48} dur={12} delay={-6}>
        <Leaf length={46} color="#8DAE7E" />
      </Floating>
      <Floating x={668} y={330} rotate={20} dur={9} delay={-1}>
        <Lychee r={30} />
      </Floating>
      <Floating x={252} y={176} rotate={0} dur={7} delay={-2} dist={-6}>
        <Sparkle size={16} color={CREAM} />
      </Floating>
      <Floating x={548} y={108} rotate={0} dur={8} delay={-3} dist={-6}>
        <Sparkle size={12} color={INK} />
      </Floating>
      <Floating x={30} y={238} rotate={0} dur={9} delay={-5} dist={-6}>
        <Sparkle size={11} color="#C58A50" />
      </Floating>

      {/* devant : fruits et perles posés sur la table */}
      <g transform="translate(642 556) rotate(18)">
        <Strawberry r={28} />
      </g>
      <g transform="translate(580 614) rotate(-70)">
        <StrawberryHalf r={20} />
      </g>
      {GROUND_PEARLS.map(([x, y, r]) => (
        <Pearl key={`${x}-${y}`} x={x} y={y} r={r} uid={uid} />
      ))}
    </svg>
  );
}
