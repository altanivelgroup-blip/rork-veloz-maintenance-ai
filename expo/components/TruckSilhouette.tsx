import React from "react";
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop, Circle } from "react-native-svg";

export default function TruckSilhouette({ width = 220, height = 110, tint = "#7CC4FF" }: { width?: number; height?: number; tint?: string }) {
  const id = `truck-${tint.replace("#", "")}`;
  return (
    <Svg width={width} height={height} viewBox="0 0 220 110">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity="0.95" />
          <Stop offset="1" stopColor={tint} stopOpacity="0.35" />
        </LinearGradient>
      </Defs>
      <G fill={`url(#${id})`}>
        {/* Bed / box */}
        <Rect x="6" y="36" width="120" height="46" rx="4" />
        {/* Cab */}
        <Path d="M126 36 L162 36 L182 56 L182 82 L126 82 Z" />
        {/* Window */}
        <Path d="M134 44 L160 44 L172 58 L134 58 Z" fill="rgba(255,255,255,0.18)" />
        {/* Hood */}
        <Rect x="180" y="60" width="22" height="22" rx="3" />
        {/* Grille glow */}
        <Rect x="200" y="64" width="3" height="14" rx="1.5" fill={tint} opacity={0.9} />
      </G>
      {/* Wheels */}
      <Circle cx="32" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="56" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="100" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="170" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="194" cy="92" r="11" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </Svg>
  );
}
