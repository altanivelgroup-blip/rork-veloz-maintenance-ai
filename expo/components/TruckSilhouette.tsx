import React from "react";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { TruckSubtype } from "@/constants/mockData";

type EnterpriseTruckProfile =
  | "hotshot_pickup"
  | "dually"
  | "cab_chassis"
  | "semi_tractor"
  | "straight_truck"
  | "cargo_van";

type Props = {
  subtype: TruckSubtype;
  width?: number;
  height?: number;
  tint?: string;
  profile?: EnterpriseTruckProfile;
};

/** Enterprise blueprint renderer for trucks, vans, tractors, and vocational fleet assets. */
export default function TruckSilhouette({ subtype, width = 260, height = 130, tint = "#7CC4FF", profile }: Props) {
  const visualProfile = profile ?? getProfileForSubtype(subtype);

  return (
    <Svg width={width} height={height} viewBox="0 0 260 130">
      <BlueprintFrame tint={tint} />
      {visualProfile === "hotshot_pickup" || visualProfile === "dually" || visualProfile === "cab_chassis" ? (
        <HotshotTruck tint={tint} profile={visualProfile} />
      ) : visualProfile === "cargo_van" ? (
        <CargoVan tint={tint} />
      ) : visualProfile === "straight_truck" ? (
        <StraightTruck tint={tint} />
      ) : (
        <SemiTractor tint={tint} heavy={subtype === "heavy_duty"} />
      )}
    </Svg>
  );
}

function getProfileForSubtype(subtype: TruckSubtype): EnterpriseTruckProfile {
  if (subtype === "heavy_duty") return "semi_tractor";
  if (subtype === "sleeper") return "straight_truck";
  return "dually";
}

function BlueprintFrame({ tint }: { tint: string }) {
  return (
    <G opacity="0.95">
      <Rect x="8" y="18" width="244" height="92" rx="10" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <Line x1="18" y1="96" x2="242" y2="96" stroke={tint} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="5 6" />
      <Line x1="22" y1="34" x2="238" y2="34" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <Line x1="22" y1="58" x2="238" y2="58" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
      <Line x1="22" y1="82" x2="238" y2="82" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
    </G>
  );
}

function BodyPath({ d, tint, opacity = 1 }: { d: string; tint: string; opacity?: number }) {
  return <Path d={d} fill="rgba(255,255,255,0.025)" stroke={tint} strokeOpacity={opacity} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />;
}

function BlueprintLine({ x1, y1, x2, y2, tint }: { x1: number; y1: number; x2: number; y2: number; tint: string }) {
  return <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tint} strokeOpacity="0.32" strokeWidth="1.2" strokeLinecap="round" />;
}

function Wheel({ cx, cy, tint, r = 12 }: { cx: number; cy: number; tint: string; r?: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#07111F" stroke={tint} strokeOpacity="0.75" strokeWidth="1.8" />
      <Circle cx={cx} cy={cy} r={r - 5} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <Circle cx={cx} cy={cy} r="2.2" fill={tint} opacity="0.8" />
    </G>
  );
}

function HotshotTruck({ tint, profile }: { tint: string; profile: EnterpriseTruckProfile }) {
  const isChassis = profile === "cab_chassis";
  return (
    <G>
      <BodyPath tint={tint} d="M30 70 L48 52 L116 52 L132 70 L224 70 L234 86 L36 86 Z" />
      <Path d="M56 54 L78 54 L74 70 L42 70 Z M84 54 L108 54 L124 70 L82 70 Z" fill="rgba(124,196,255,0.08)" stroke={tint} strokeOpacity="0.45" strokeWidth="1" />
      <Rect x="132" y="61" width={isChassis ? 74 : 84} height="14" rx="2" fill="none" stroke={tint} strokeOpacity="0.55" strokeWidth="1.4" />
      {!isChassis && <Line x1="146" y1="61" x2="146" y2="75" stroke={tint} strokeOpacity="0.3" />}
      <BlueprintLine x1={38} y1={90} x2={226} y2={90} tint={tint} />
      <Wheel cx={66} cy={92} tint={tint} />
      <Wheel cx={178} cy={92} tint={tint} />
      {profile === "dually" && <Wheel cx={202} cy={92} tint={tint} />}
      <TextRail label={profile === "cab_chassis" ? "CAB CHASSIS" : profile === "dually" ? "DUALLY / HOTSHOT" : "HOTSHOT PICKUP"} tint={tint} />
    </G>
  );
}

function SemiTractor({ tint, heavy }: { tint: string; heavy: boolean }) {
  return (
    <G>
      <BodyPath tint={tint} d={heavy ? "M28 74 L104 74 L112 40 L150 40 L174 58 L212 58 L226 76 L226 88 L30 88 Z" : "M34 74 L112 74 L120 42 L154 42 L178 58 L210 58 L224 76 L224 88 L36 88 Z"} />
      <Path d="M126 47 L150 47 L168 59 L122 59 Z" fill="rgba(124,196,255,0.08)" stroke={tint} strokeOpacity="0.45" strokeWidth="1" />
      <Rect x="52" y="64" width="48" height="8" rx="2" fill="none" stroke={tint} strokeOpacity="0.38" strokeWidth="1.2" />
      <Circle cx="112" cy="69" r="5" fill="none" stroke={tint} strokeOpacity="0.55" strokeWidth="1.4" />
      <Line x1="182" y1="58" x2="182" y2="88" stroke={tint} strokeOpacity="0.35" />
      <BlueprintLine x1={36} y1={92} x2={226} y2={92} tint={tint} />
      <Wheel cx={196} cy={94} tint={tint} />
      <Wheel cx={58} cy={94} tint={tint} />
      <Wheel cx={84} cy={94} tint={tint} />
      {heavy && <Wheel cx={110} cy={94} tint={tint} />}
      <TextRail label={heavy ? "HEAVY DUTY TRACTOR" : "SEMI TRACTOR"} tint={tint} />
    </G>
  );
}

function StraightTruck({ tint }: { tint: string }) {
  return (
    <G>
      <Rect x="34" y="48" width="124" height="36" rx="3" fill="rgba(255,255,255,0.025)" stroke={tint} strokeOpacity="0.9" strokeWidth="2" />
      <BodyPath tint={tint} d="M158 50 L188 50 L214 66 L224 84 L158 84 Z" />
      <Path d="M164 56 L184 56 L204 67 L164 67 Z" fill="rgba(124,196,255,0.08)" stroke={tint} strokeOpacity="0.42" strokeWidth="1" />
      <Line x1="58" y1="48" x2="58" y2="84" stroke={tint} strokeOpacity="0.22" />
      <Line x1="94" y1="48" x2="94" y2="84" stroke={tint} strokeOpacity="0.18" />
      <Line x1="130" y1="48" x2="130" y2="84" stroke={tint} strokeOpacity="0.18" />
      <BlueprintLine x1={38} y1={91} x2={222} y2={91} tint={tint} />
      <Wheel cx={72} cy={94} tint={tint} />
      <Wheel cx={142} cy={94} tint={tint} />
      <Wheel cx={198} cy={94} tint={tint} />
      <TextRail label="STRAIGHT TRUCK" tint={tint} />
    </G>
  );
}

function CargoVan({ tint }: { tint: string }) {
  return (
    <G>
      <BodyPath tint={tint} d="M34 78 L44 54 L152 48 L202 54 L226 76 L220 88 L40 88 Z" />
      <Path d="M58 56 L104 54 L100 70 L48 70 Z M112 54 L154 53 L172 70 L108 70 Z" fill="rgba(124,196,255,0.08)" stroke={tint} strokeOpacity="0.42" strokeWidth="1" />
      <Line x1="112" y1="54" x2="112" y2="88" stroke={tint} strokeOpacity="0.22" />
      <Line x1="164" y1="62" x2="164" y2="88" stroke={tint} strokeOpacity="0.2" />
      <BlueprintLine x1={42} y1={92} x2={218} y2={92} tint={tint} />
      <Wheel cx={72} cy={94} tint={tint} />
      <Wheel cx={194} cy={94} tint={tint} />
      <TextRail label="CARGO VAN" tint={tint} />
    </G>
  );
}

function TextRail({ label, tint }: { label: string; tint: string }) {
  return (
    <G>
      <Rect x="18" y="22" width="82" height="13" rx="2" fill="rgba(255,255,255,0.03)" stroke={tint} strokeOpacity="0.18" />
      <SvgText x="24" y="31" fill={tint} opacity="0.74" fontSize="7" fontWeight="700" letterSpacing="1">
        {label}
      </SvgText>
      <Rect x="104" y="24" width="2" height="9" fill={tint} opacity="0.45" />
      <Rect x="110" y="24" width="2" height="9" fill={tint} opacity="0.28" />
      <Rect x="116" y="24" width="2" height="9" fill={tint} opacity="0.2" />
      <Path d="M126 29 L230 29" stroke={tint} strokeOpacity="0.22" strokeWidth="1" />
    </G>
  );
}
