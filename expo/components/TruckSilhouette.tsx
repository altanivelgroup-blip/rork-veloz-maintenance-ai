import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { TruckSubtype } from "@/constants/mockData";

type Props = {
  subtype: TruckSubtype;
  width?: number;
  height?: number;
  tint?: string;
};

/** Polymorphic truck renderer — Day Cab, Sleeper Berth, or Heavy Duty Rig. */
export default function TruckSilhouette({ subtype, width = 260, height = 130, tint = "#7CC4FF" }: Props) {
  const uid = `t-${subtype}-${tint.replace("#", "")}`;
  return (
    <Svg width={width} height={height} viewBox="0 0 260 130">
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity="0.95" />
          <Stop offset="0.5" stopColor={tint} stopOpacity="0.5" />
          <Stop offset="1" stopColor={tint} stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>

      {subtype === "daycab" ? <DayCab uid={uid} tint={tint} /> : subtype === "sleeper" ? <Sleeper uid={uid} tint={tint} /> : <HeavyDuty uid={uid} tint={tint} />}
    </Svg>
  );
}

/* ─── Day Cab Tractor ─── */
function DayCab({ uid, tint }: { uid: string; tint: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="10" y="58" width="130" height="12" rx="3" />
        <Rect x="10" y="70" width="130" height="28" rx="5" />
        <Rect x="50" y="50" width="30" height="8" rx="4" opacity="0.7" />
        <Path d="M140 38 L168 38 L198 54 L198 98 L140 98 Z" />
        <Rect x="150" y="34" width="38" height="4" rx="2" opacity="0.85" />
        <Path d="M146 46 L170 46 L188 56 L146 56 Z" fill={`url(#${uid}-glass)`} />
        <Path d="M146 60 L170 60 L188 68 L146 68 Z" fill={`url(#${uid}-glass)`} opacity="0.6" />
        <Rect x="196" y="56" width="18" height="20" rx="3" />
        <Rect x="210" y="60" width="14" height="16" rx="2" opacity="0.7" />
        <Rect x="218" y="44" width="5" height="32" rx="2.5" fill={tint} opacity="0.85" />
        <Rect x="196" y="90" width="30" height="6" rx="3" opacity="0.65" />
        <Path d="M58 70 Q64 63 78 70 Q90 82 96 98 L42 98 Q48 82 58 70 Z" opacity="0.75" />
      </G>
      {/* Wheels — steer + tandem dually */}
      <Circle cx="184" cy="106" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="42" cy="106" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="68" cy="106" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="94" cy="106" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="120" cy="106" r="12" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="184" cy="106" r="3" fill="rgba(255,255,255,0.3)" />
      <Circle cx="42" cy="106" r="3" fill="rgba(255,255,255,0.3)" />
      <Circle cx="68" cy="106" r="3" fill="rgba(255,255,255,0.3)" />
      <Circle cx="94" cy="106" r="3" fill="rgba(255,255,255,0.3)" />
      <Circle cx="120" cy="106" r="3" fill="rgba(255,255,255,0.3)" />
    </>
  );
}

/* ─── Sleeper Berth ─── */
function Sleeper({ uid, tint }: { uid: string; tint: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="8" y="72" width="100" height="8" rx="2" opacity="0.5" />
        <Rect x="14" y="60" width="36" height="18" rx="6" opacity="0.65" />
        <Rect x="56" y="60" width="36" height="18" rx="6" opacity="0.55" />
        <Rect x="102" y="42" width="44" height="42" rx="6" />
        <Path d="M108 42 L118 24 L134 24 L142 42 Z" opacity="0.8" />
        <Path d="M146 38 L166 38 L192 52 L192 84 L146 84 Z" />
        <Rect x="150" y="34" width="32" height="4" rx="2" opacity="0.85" />
        <Path d="M154 46 L172 46 L184 54 L154 54 Z" fill={`url(#${uid}-glass)`} />
        <Path d="M154 58 L172 58 L184 64 L154 64 Z" fill={`url(#${uid}-glass)`} opacity="0.6" />
        <Rect x="116" y="48" width="20" height="18" rx="4" fill={`url(#${uid}-glass)`} opacity="0.5" />
        <Rect x="192" y="54" width="20" height="22" rx="3" />
        <Rect x="206" y="58" width="16" height="18" rx="2" opacity="0.7" />
        <Rect x="218" y="42" width="5" height="34" rx="2.5" fill={tint} opacity="0.85" />
        <Rect x="136" y="16" width="4" height="22" rx="2" opacity="0.45" />
        <Rect x="150" y="28" width="38" height="6" rx="3" opacity="0.4" />
      </G>
      {/* Wheels — steer + tandem drive */}
      <Circle cx="186" cy="102" r="13" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="36" cy="102" r="13" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="62" cy="102" r="13" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="88" cy="102" r="13" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="114" cy="102" r="13" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="186" cy="102" r="3.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="36" cy="102" r="3.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="62" cy="102" r="3.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="88" cy="102" r="3.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="114" cy="102" r="3.5" fill="rgba(255,255,255,0.3)" />
    </>
  );
}

/* ─── Heavy Duty Rig ─── */
function HeavyDuty({ uid, tint }: { uid: string; tint: string }) {
  return (
    <>
      <G fill={`url(#${uid})`}>
        <Rect x="6" y="80" width="80" height="10" rx="2" opacity="0.4" />
        <Rect x="10" y="64" width="38" height="22" rx="8" opacity="0.65" />
        <Rect x="54" y="64" width="32" height="20" rx="8" opacity="0.55" />
        <Rect x="98" y="40" width="50" height="50" rx="8" />
        <Rect x="110" y="46" width="24" height="20" rx="5" fill={`url(#${uid}-glass)`} opacity="0.45" />
        <Path d="M104 40 L114 14 L134 14 L146 40 Z" opacity="0.8" />
        <Path d="M148 36 L166 36 L194 50 L194 90 L148 90 Z" />
        <Rect x="152" y="30" width="32" height="6" rx="3" opacity="0.85" />
        <Path d="M156 44 L172 44 L186 52 L156 52 Z" fill={`url(#${uid}-glass)`} />
        <Path d="M156 56 L172 56 L186 62 L156 62 Z" fill={`url(#${uid}-glass)`} opacity="0.5" />
        <Rect x="194" y="50" width="26" height="28" rx="4" />
        <Rect x="214" y="54" width="22" height="24" rx="3" opacity="0.7" />
        <Rect x="230" y="36" width="6" height="42" rx="3" fill={tint} opacity="0.9" />
        <Rect x="194" y="84" width="44" height="8" rx="4" opacity="0.6" />
        <Rect x="170" y="24" width="10" height="18" rx="5" opacity="0.6" />
        <Rect x="184" y="24" width="10" height="18" rx="5" opacity="0.5" />
        <Rect x="138" y="12" width="5" height="28" rx="2.5" opacity="0.45" />
        <Rect x="152" y="24" width="44" height="8" rx="4" opacity="0.4" />
      </G>
      {/* Wheels — steer + dual drive axles */}
      <Circle cx="204" cy="108" r="14" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="30" cy="108" r="14" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="56" cy="108" r="14" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="82" cy="108" r="14" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="108" cy="108" r="14" fill="#0A1628" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <Circle cx="204" cy="108" r="4" fill="rgba(255,255,255,0.3)" />
      <Circle cx="30" cy="108" r="4" fill="rgba(255,255,255,0.3)" />
      <Circle cx="56" cy="108" r="4" fill="rgba(255,255,255,0.3)" />
      <Circle cx="82" cy="108" r="4" fill="rgba(255,255,255,0.3)" />
      <Circle cx="108" cy="108" r="4" fill="rgba(255,255,255,0.3)" />
    </>
  );
}
