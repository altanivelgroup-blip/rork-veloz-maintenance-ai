import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { TrailerSubtype } from "@/constants/mockData";

type Props = {
  subtype: TrailerSubtype;
  width?: number;
  height?: number;
  tint?: string;
  enclosed?: boolean;
};

/** Polymorphic trailer renderer — 7 subtypes from 1-car enclosed through 9-car stinger-steer. */
export default function TrailerSilhouette({ subtype, width = 260, height = 120, tint = "#5EE7FF", enclosed: _enc }: Props) {
  const uid = `tr-${subtype}-${tint.replace("#", "")}`;
  return (
    <Svg width={width} height={height} viewBox="0 0 260 120">
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity="0.95" />
          <Stop offset="0.5" stopColor={tint} stopOpacity="0.5" />
          <Stop offset="1" stopColor={tint} stopOpacity="0.18" />
        </LinearGradient>
      </Defs>

      {subtype === "1car_enclosed" ? <OneCarEnclosed uid={uid} /> : null}
      {subtype === "2car_open" ? <TwoCarOpen uid={uid} /> : null}
      {subtype === "2car_enclosed" ? <TwoCarEnclosed uid={uid} /> : null}
      {subtype === "3car_wedge" ? <Wedge uid={uid} cars={3} /> : null}
      {subtype === "4car_wedge" ? <Wedge uid={uid} cars={4} /> : null}
      {subtype === "5car_quickloader" ? <QuickLoader uid={uid} /> : null}
      {subtype === "9car_stinger" ? <Stinger uid={uid} /> : null}
    </Svg>
  );
}

/* ─── 1-Car Enclosed ─── */
function OneCarEnclosed({ uid }: { uid: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="10" y="62" width="40" height="6" rx="3" opacity="0.5" />
        <Rect x="6" y="58" width="10" height="14" rx="4" opacity="0.6" />
        <Rect x="50" y="22" width="140" height="60" rx="6" />
        <Rect x="90" y="18" width="30" height="6" rx="3" opacity="0.35" />
        <Rect x="185" y="34" width="5" height="40" rx="2.5" opacity="0.3" />
        <Rect x="70" y="38" width="20" height="14" rx="2" fill="#fff" opacity="0.12" />
        <Path d="M78 82 Q86 72 100 82 Q112 92 118 82 L76 82 Z" opacity="0.5" />
      </G>
      <Circle cx="80" cy="96" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="110" cy="96" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}

/* ─── 2-Car Open Deck ─── */
function TwoCarOpen({ uid }: { uid: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="10" y="66" width="44" height="6" rx="3" opacity="0.5" />
        <Rect x="6" y="62" width="10" height="14" rx="4" opacity="0.6" />
        <Rect x="54" y="54" width="150" height="10" rx="3" />
        <Rect x="52" y="42" width="42" height="14" rx="3" />
        <Path d="M196 54 L196 84 L182 64 Z" opacity="0.7" />
        <Path d="M204 54 L204 84 L218 64 Z" opacity="0.7" />
        <Rect x="74" y="36" width="3" height="18" rx="1" opacity="0.5" />
        <Rect x="110" y="36" width="3" height="18" rx="1" opacity="0.5" />
        <Rect x="146" y="36" width="3" height="18" rx="1" opacity="0.5" />
        <Rect x="182" y="36" width="3" height="18" rx="1" opacity="0.5" />
        <Rect x="72" y="34" width="116" height="4" rx="2" opacity="0.45" />
        <Path d="M78 64 Q86 56 100 64 Q112 74 118 64 L76 64 Z" opacity="0.45" />
        <Path d="M150 64 Q158 56 172 64 Q184 74 190 64 L148 64 Z" opacity="0.45" />
      </G>
      <Circle cx="80" cy="92" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="110" cy="92" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="152" cy="92" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="182" cy="92" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}

/* ─── 2-Car Enclosed ─── */
function TwoCarEnclosed({ uid }: { uid: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="10" y="58" width="44" height="6" rx="3" opacity="0.5" />
        <Rect x="6" y="54" width="10" height="14" rx="4" opacity="0.6" />
        <Rect x="54" y="18" width="170" height="62" rx="6" />
        <Rect x="80" y="14" width="50" height="5" rx="2.5" opacity="0.3" />
        <Rect x="140" y="14" width="50" height="5" rx="2.5" opacity="0.3" />
        <Rect x="64" y="44" width="150" height="3" rx="1.5" opacity="0.2" />
        <Rect x="64" y="52" width="150" height="3" rx="1.5" opacity="0.2" />
        <Rect x="219" y="32" width="5" height="40" rx="2.5" opacity="0.3" />
        <Rect x="72" y="28" width="18" height="12" rx="2" fill="#fff" opacity="0.12" />
        <Rect x="160" y="28" width="18" height="12" rx="2" fill="#fff" opacity="0.12" />
        <Path d="M82 80 Q92 68 110 80 Q124 92 134 80 L78 80 Z" opacity="0.45" />
        <Path d="M160 80 Q170 68 188 80 Q202 92 212 80 L156 80 Z" opacity="0.45" />
      </G>
      <Circle cx="86" cy="96" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="118" cy="96" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="164" cy="96" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="196" cy="96" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}

/* ─── 3/4-Car Wedge ─── */
function Wedge({ uid, cars }: { uid: string; cars: 3 | 4 }) {
  const deckLen = cars === 3 ? 180 : 210;
  const midPost = cars === 3 ? "140" : "160";
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="8" y="64" width="48" height="6" rx="3" opacity="0.5" />
        <Rect x="4" y="60" width="10" height="14" rx="4" opacity="0.6" />
        <Path d={`M56 56 L${56 + deckLen} 56 L${56 + deckLen - 20} 78 L56 56 Z`} opacity="0.7" />
        <Rect x="56" y="20" width={deckLen - 20} height="16" rx="4" />
        <Rect x="56" y="8" width={deckLen - 40} height="14" rx="4" opacity="0.7" />
        <Rect x="100" y="22" width="3" height="24" rx="1" opacity="0.45" />
        <Rect x={midPost} y="22" width="3" height="24" rx="1" opacity="0.45" />
        <Rect x="56" y="18" width={deckLen - 20} height="3" rx="1.5" opacity="0.4" />
      </G>
      <Circle cx="72" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="104" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="138" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="172" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="204" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}

/* ─── 5-Car Quick-Loader ─── */
function QuickLoader({ uid }: { uid: string }) {
  const len = 210;
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="8" y="68" width="48" height="6" rx="3" opacity="0.5" />
        <Rect x="4" y="64" width="10" height="14" rx="4" opacity="0.6" />
        <Rect x="56" y="48" width={len - 20} height="10" rx="3" />
        <Rect x="56" y="32" width={len - 30} height="10" rx="3" opacity="0.75" />
        <Rect x="56" y="16" width={len - 40} height="10" rx="3" opacity="0.55" />
        <Rect x="80" y="22" width="4" height="26" rx="2" opacity="0.4" />
        <Rect x="140" y="22" width="4" height="26" rx="2" opacity="0.4" />
        <Rect x="190" y="22" width="4" height="26" rx="2" opacity="0.4" />
        <Path d={`M${56 + len - 24} 48 L${56 + len - 12} 74 L${56 + len - 36} 58 Z`} opacity="0.65" />
      </G>
      <Circle cx="70" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="102" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="136" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="170" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="204" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}

/* ─── 9-Car Stinger-Steer ─── */
function Stinger({ uid }: { uid: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="6" y="64" width="30" height="8" rx="4" opacity="0.55" />
        <Rect x="2" y="60" width="8" height="16" rx="4" opacity="0.6" />
        <Rect x="36" y="14" width="90" height="14" rx="4" opacity="0.65" />
        <Rect x="36" y="44" width="90" height="10" rx="3" />
        <Circle cx="126" cy="50" r="6" opacity="0.5" />
        <Rect x="132" y="14" width="98" height="14" rx="4" opacity="0.65" />
        <Rect x="132" y="44" width="98" height="10" rx="3" />
        <Rect x="60" y="28" width="3" height="16" rx="1" opacity="0.4" />
        <Rect x="96" y="28" width="3" height="16" rx="1" opacity="0.4" />
        <Rect x="160" y="28" width="3" height="16" rx="1" opacity="0.4" />
        <Rect x="200" y="28" width="3" height="16" rx="1" opacity="0.4" />
        <Rect x="36" y="12" width="90" height="2" rx="1" opacity="0.35" />
        <Rect x="132" y="12" width="98" height="2" rx="1" opacity="0.35" />
        <Rect x="36" y="42" width="90" height="2" rx="1" opacity="0.3" />
        <Rect x="132" y="42" width="98" height="2" rx="1" opacity="0.3" />
        <Path d="M228 44 L228 68 L238 54 Z" opacity="0.55" />
      </G>
      <Circle cx="60" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="92" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="142" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="176" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="210" cy="90" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </>
  );
}
