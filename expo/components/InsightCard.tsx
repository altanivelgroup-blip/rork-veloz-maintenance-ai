import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react-native";
import { Colors } from "@/constants/colors";

type Severity = "info" | "warn" | "fail";

const meta: Record<Severity, { color: string; bg: string; Icon: typeof Info }> = {
  info: { color: Colors.cyan, bg: "rgba(94,231,255,0.10)", Icon: Info },
  warn: { color: Colors.amber, bg: "rgba(255,181,71,0.10)", Icon: AlertTriangle },
  fail: { color: Colors.red, bg: "rgba(255,84,112,0.12)", Icon: ShieldAlert },
};

export default function InsightCard({ severity, title, detail, equipment }: { severity: Severity; title: string; detail: string; equipment?: string }) {
  const m = meta[severity];
  const Icon = m.Icon;
  return (
    <View style={[styles.wrap, { backgroundColor: m.bg, borderColor: m.color + "33" }]}>
      <View style={[styles.iconWrap, { backgroundColor: m.color + "22" }]}>
        <Icon color={m.color} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        {equipment && <Text style={[styles.eq, { color: m.color }]}>{equipment}</Text>}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eq: { fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase", marginBottom: 2 },
  title: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  detail: { color: Colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 17 },
});
