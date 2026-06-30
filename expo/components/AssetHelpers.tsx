import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, statusMeta } from "@/constants/colors";
import StatusBadge from "@/components/StatusBadge";

/** Key-value tile used in asset detail grids. */
export function KV({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={styles.kvLabel}>{label}</Text>
      </View>
      <Text style={styles.kvValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

/** Module health row with icon, label, value, and compact status badge.
 *  Accepts an optional `onPress` — when provided (and status is not "operational"),
 *  the row becomes tappable, bridging to an "Open Shop Repair Ticket" drawer. */
export function ModuleRow({
  icon,
  label,
  value,
  status,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: keyof typeof statusMeta;
  onPress?: () => void;
}) {
  const isTappable = onPress != null && status !== "operational";
  const content = (
    <View style={[styles.modRow, isTappable && styles.modRowTappable]}>
      <View style={[styles.iconBubble, { backgroundColor: status !== "operational" ? "rgba(255,181,71,0.12)" : "rgba(94,231,255,0.10)" }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modLabel}>{label}</Text>
        <Text style={styles.modValue}>{value}</Text>
      </View>
      <StatusBadge status={status} compact />
    </View>
  );

  if (isTappable) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

/** Thin 1px divider for card interiors. */
export function Divider() {
  return <View style={styles.divider} />;
}

/** Compact stat tile (label + large value) for mini stat rows. */
export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kv: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kvLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  kvValue: { color: Colors.text, fontSize: 13, fontWeight: "700", marginTop: 4 },
  modRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  modRowTappable: { paddingHorizontal: 4, borderRadius: 12 },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  modValue: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 2 },
  miniStat: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  miniValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 4,
  },
});
