import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function MetricBar({
  label,
  value,
  suffix = "%",
  good = 80,
  warn = 50,
}: {
  label: string;
  value: number;
  suffix?: string;
  good?: number;
  warn?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const colors: readonly [string, string] =
    v >= good ? ["#22D399", "#5EE7FF"] : v >= warn ? ["#FFD27A", "#FF9D24"] : ["#FF7A91", "#E2334E"];
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value)}{suffix}</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${v}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: "600", letterSpacing: 0.2 },
  value: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  track: { height: 8, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
});
