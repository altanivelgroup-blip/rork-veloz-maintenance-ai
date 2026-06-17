import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export default function TrailerSilhouette({ width = 220, height = 100, tint = "#5EE7FF", enclosed = false }: { width?: number; height?: number; tint?: string; enclosed?: boolean }) {
  const id = `tr-${tint.replace("#", "")}-${enclosed ? "e" : "o"}`;
  return (
    <Svg width={width} height={height} viewBox="0 0 220 100">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity="0.95" />
          <Stop offset="1" stopColor={tint} stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      {enclosed ? (
        <G fill={`url(#${id})`}>
          <Rect x="10" y="20" width="190" height="56" rx="4" />
          <Rect x="170" y="34" width="20" height="20" rx="1" fill="rgba(255,255,255,0.18)" />
        </G>
      ) : (
        <G fill={`url(#${id})`}>
          {/* Deck */}
          <Rect x="8" y="58" width="200" height="14" rx="2" />
          {/* Ramps stack */}
          <Path d="M8 58 L8 36 L40 58 Z" />
          <Rect x="178" y="46" width="22" height="12" rx="1" />
          {/* Side rails */}
          <Rect x="60" y="50" width="2" height="14" />
          <Rect x="100" y="50" width="2" height="14" />
          <Rect x="140" y="50" width="2" height="14" />
        </G>
      )}
      {/* Wheels */}
      <Circle cx="60" cy="84" r="10" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="86" cy="84" r="10" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="112" cy="84" r="10" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <Circle cx="146" cy="84" r="10" fill="#0A1628" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </Svg>
  );
}
