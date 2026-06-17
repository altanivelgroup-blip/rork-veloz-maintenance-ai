import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Colors } from "@/constants/colors";

function healthColor(value: number) {
  if (value >= 80) return ["#22D399", "#5EE7FF"] as const;
  if (value >= 60) return ["#FFD27A", "#FF9D24"] as const;
  return ["#FF7A91", "#E2334E"] as const;
}

export default function HealthGauge({ value, size = 120, label = "Health", thickness = 10 }: { value: number; size?: number; label?: string; thickness?: number }) {
  const radius = (size - thickness) / 2;
  const c = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (c * clamped) / 100;
  const [from, to] = healthColor(clamped);
  const id = `g-${Math.round(clamped)}-${size}`;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.value, { fontSize: size * 0.26 }]}>{clamped}<Text style={styles.pct}>%</Text></Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  value: { color: Colors.text, fontWeight: "800", letterSpacing: -0.5 },
  pct: { color: Colors.textMuted, fontSize: 12, fontWeight: "700" },
  label: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.5, marginTop: -2, textTransform: "uppercase" },
});
