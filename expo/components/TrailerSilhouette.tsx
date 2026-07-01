import React from "react";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { TrailerSubtype } from "@/constants/mockData";

type EnterpriseTrailerProfile =
  | "enclosed_trailer"
  | "gooseneck"
  | "wedge"
  | "flatbed"
  | "dry_van"
  | "lowboy"
  | "equipment_trailer"
  | "stinger";

type Props = {
  subtype: TrailerSubtype;
  width?: number;
  height?: number;
  tint?: string;
  enclosed?: boolean;
  profile?: EnterpriseTrailerProfile;
};

/** Enterprise blueprint renderer for enclosed, gooseneck, wedge, flatbed, dry van, lowboy, equipment, and stinger trailers. */
export default function TrailerSilhouette({ subtype, width = 260, height = 120, tint = "#5EE7FF", enclosed, profile }: Props) {
  const visualProfile = profile ?? getProfileForSubtype(subtype, enclosed);

  return (
    <Svg width={width} height={height} viewBox="0 0 260 120">
      <BlueprintFrame tint={tint} />
      {visualProfile === "enclosed_trailer" || visualProfile === "dry_van" ? (
        <EnclosedTrailer tint={tint} dryVan={visualProfile === "dry_van"} />
      ) : visualProfile === "stinger" ? (
        <StingerTrailer tint={tint} />
      ) : visualProfile === "wedge" ? (
        <WedgeTrailer tint={tint} longDeck={subtype === "4car_wedge" || subtype === "5car_quickloader"} />
      ) : visualProfile === "lowboy" ? (
        <LowboyTrailer tint={tint} />
      ) : visualProfile === "equipment_trailer" ? (
        <EquipmentTrailer tint={tint} />
      ) : (
        <GooseneckFlatbed tint={tint} flatbed={visualProfile === "flatbed"} />
      )}
    </Svg>
  );
}

function getProfileForSubtype(subtype: TrailerSubtype, enclosed?: boolean): EnterpriseTrailerProfile {
  if (subtype === "1car_enclosed" || subtype === "2car_enclosed" || enclosed) return "enclosed_trailer";
  if (subtype === "3car_wedge" || subtype === "4car_wedge" || subtype === "5car_quickloader") return "wedge";
  if (subtype === "9car_stinger") return "stinger";
  return "gooseneck";
}

function BlueprintFrame({ tint }: { tint: string }) {
  return (
    <G opacity="0.96">
      <Rect x="8" y="15" width="244" height="82" rx="10" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <Line x1="18" y1="84" x2="242" y2="84" stroke={tint} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="5 6" />
      <Line x1="22" y1="30" x2="238" y2="30" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
      <Line x1="22" y1="54" x2="238" y2="54" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
      <Line x1="22" y1="78" x2="238" y2="78" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
    </G>
  );
}

function OutlineRect({ x, y, width, height, tint, rx = 3, opacity = 0.92 }: { x: number; y: number; width: number; height: number; tint: string; rx?: number; opacity?: number }) {
  return <Rect x={x} y={y} width={width} height={height} rx={rx} fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity={opacity} strokeWidth="2" />;
}

function Wheel({ cx, cy, tint, r = 10 }: { cx: number; cy: number; tint: string; r?: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#07111F" stroke={tint} strokeOpacity="0.72" strokeWidth="1.6" />
      <Circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <Circle cx={cx} cy={cy} r="2" fill={tint} opacity="0.75" />
    </G>
  );
}

function Hitch({ tint, y = 65 }: { tint: string; y?: number }) {
  return (
    <G>
      <Line x1="16" y1={y} x2="56" y2={y} stroke={tint} strokeOpacity="0.72" strokeWidth="2" strokeLinecap="round" />
      <Path d={`M16 ${y - 5} L8 ${y} L16 ${y + 5}`} fill="none" stroke={tint} strokeOpacity="0.65" strokeWidth="1.8" strokeLinejoin="round" />
    </G>
  );
}

function LabelRail({ label, tint }: { label: string; tint: string }) {
  return (
    <G>
      <Rect x="18" y="19" width="118" height="13" rx="2" fill="rgba(255,255,255,0.03)" stroke={tint} strokeOpacity="0.18" />
      <SvgText x="24" y="28.5" fill={tint} opacity="0.74" fontSize="7" fontWeight="700" letterSpacing="1.1">
        {label}
      </SvgText>
      <Line x1="144" y1="26" x2="232" y2="26" stroke={tint} strokeOpacity="0.22" strokeWidth="1" />
    </G>
  );
}

function EnclosedTrailer({ tint, dryVan }: { tint: string; dryVan: boolean }) {
  return (
    <G>
      <Hitch tint={tint} y={68} />
      <OutlineRect x={54} y={37} width={dryVan ? 180 : 158} height={40} tint={tint} rx={4} />
      <Line x1="70" y1="43" x2={dryVan ? "220" : "198"} y2="43" stroke={tint} strokeOpacity="0.22" />
      <Line x1="70" y1="63" x2={dryVan ? "220" : "198"} y2="63" stroke={tint} strokeOpacity="0.18" />
      <Line x1={dryVan ? "224" : "202"} y1="40" x2={dryVan ? "224" : "202"} y2="75" stroke={tint} strokeOpacity="0.35" />
      <Wheel cx={94} cy={84} tint={tint} />
      <Wheel cx={122} cy={84} tint={tint} />
      <Wheel cx={dryVan ? 190 : 166} cy={84} tint={tint} />
      <Wheel cx={dryVan ? 218 : 194} cy={84} tint={tint} />
      <LabelRail label={dryVan ? "DRY VAN / BOX" : "ENCLOSED TRAILER"} tint={tint} />
    </G>
  );
}

function GooseneckFlatbed({ tint, flatbed }: { tint: string; flatbed: boolean }) {
  return (
    <G>
      <Hitch tint={tint} y={66} />
      <Path d="M50 66 L68 48 L112 48 L112 58 L232 58 L240 70 L56 70 Z" fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.9" strokeWidth="2" strokeLinejoin="round" />
      <Line x1="76" y1="49" x2="76" y2="70" stroke={tint} strokeOpacity="0.22" />
      <Line x1="132" y1="58" x2="132" y2="70" stroke={tint} strokeOpacity="0.18" />
      <Line x1="176" y1="58" x2="176" y2="70" stroke={tint} strokeOpacity="0.18" />
      {flatbed && <Rect x="118" y="49" width="96" height="7" rx="1.5" fill="none" stroke={tint} strokeOpacity="0.4" />}
      <Wheel cx={90} cy={84} tint={tint} />
      <Wheel cx={120} cy={84} tint={tint} />
      <Wheel cx={178} cy={84} tint={tint} />
      <Wheel cx={208} cy={84} tint={tint} />
      <LabelRail label={flatbed ? "FLATBED" : "GOOSENECK TRAILER"} tint={tint} />
    </G>
  );
}

function WedgeTrailer({ tint, longDeck }: { tint: string; longDeck: boolean }) {
  return (
    <G>
      <Hitch tint={tint} y={70} />
      <Path d={longDeck ? "M54 68 L236 42 L244 56 L74 78 Z" : "M54 68 L218 45 L232 58 L74 78 Z"} fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.92" strokeWidth="2" strokeLinejoin="round" />
      <Line x1="72" y1="65" x2={longDeck ? "224" : "206"} y2="44" stroke={tint} strokeOpacity="0.28" />
      <Line x1="100" y1="62" x2="100" y2="75" stroke={tint} strokeOpacity="0.2" />
      <Line x1="142" y1="56" x2="142" y2="70" stroke={tint} strokeOpacity="0.2" />
      <Line x1="184" y1="50" x2="184" y2="64" stroke={tint} strokeOpacity="0.2" />
      <Wheel cx={82} cy={84} tint={tint} />
      <Wheel cx={112} cy={84} tint={tint} />
      <Wheel cx={148} cy={84} tint={tint} />
      <Wheel cx={184} cy={84} tint={tint} />
      {longDeck && <Wheel cx={218} cy={84} tint={tint} />}
      <LabelRail label={longDeck ? "EXTENDED WEDGE" : "WEDGE TRAILER"} tint={tint} />
    </G>
  );
}

function StingerTrailer({ tint }: { tint: string }) {
  return (
    <G>
      <Hitch tint={tint} y={70} />
      <Path d="M38 68 L116 40 L122 52 L54 77 Z" fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.78" strokeWidth="1.8" />
      <Circle cx="124" cy="58" r="6" fill="none" stroke={tint} strokeOpacity="0.58" strokeWidth="1.6" />
      <Path d="M130 52 L232 38 L244 52 L148 72 Z" fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.9" strokeWidth="2" />
      <Line x1="60" y1="61" x2="110" y2="43" stroke={tint} strokeOpacity="0.25" />
      <Line x1="152" y1="49" x2="226" y2="39" stroke={tint} strokeOpacity="0.25" />
      <Wheel cx={68} cy={84} tint={tint} />
      <Wheel cx={98} cy={84} tint={tint} />
      <Wheel cx={154} cy={84} tint={tint} />
      <Wheel cx={190} cy={84} tint={tint} />
      <Wheel cx={224} cy={84} tint={tint} />
      <LabelRail label="STINGER-STEER" tint={tint} />
    </G>
  );
}

function LowboyTrailer({ tint }: { tint: string }) {
  return (
    <G>
      <Hitch tint={tint} y={62} />
      <Path d="M50 62 L84 50 L104 50 L112 68 L190 68 L202 50 L232 50 L242 66 L56 78 Z" fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.9" strokeWidth="2" strokeLinejoin="round" />
      <Line x1="116" y1="68" x2="188" y2="68" stroke={tint} strokeOpacity="0.35" strokeWidth="3" />
      <Wheel cx={82} cy={84} tint={tint} />
      <Wheel cx={212} cy={84} tint={tint} />
      <Wheel cx={234} cy={84} tint={tint} />
      <LabelRail label="LOWBOY" tint={tint} />
    </G>
  );
}

function EquipmentTrailer({ tint }: { tint: string }) {
  return (
    <G>
      <Hitch tint={tint} y={66} />
      <Path d="M54 64 L222 64 L238 76 L60 76 Z" fill="rgba(255,255,255,0.018)" stroke={tint} strokeOpacity="0.9" strokeWidth="2" strokeLinejoin="round" />
      <Rect x="92" y="50" width="86" height="12" rx="2" fill="none" stroke={tint} strokeOpacity="0.4" strokeDasharray="5 4" />
      <Line x1="78" y1="64" x2="78" y2="76" stroke={tint} strokeOpacity="0.2" />
      <Line x1="188" y1="64" x2="188" y2="76" stroke={tint} strokeOpacity="0.2" />
      <Wheel cx={94} cy={84} tint={tint} />
      <Wheel cx={124} cy={84} tint={tint} />
      <Wheel cx={182} cy={84} tint={tint} />
      <Wheel cx={212} cy={84} tint={tint} />
      <LabelRail label="EQUIPMENT TRAILER" tint={tint} />
    </G>
  );
}
