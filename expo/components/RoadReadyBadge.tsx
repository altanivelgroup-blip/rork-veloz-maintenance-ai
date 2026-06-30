import { ShieldCheck, AlertTriangle, XOctagon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { roadReadyMeta } from "@/constants/mockData";
import type { RoadReadyStatus } from "@/constants/mockData";

type Props = { status: RoadReadyStatus; compact?: boolean };

/** Multi-tier safety metric badge — Road Ready / Restricted Use / Out of Service. */
export default function RoadReadyBadge({ status, compact }: Props) {
  const meta = roadReadyMeta[status];
  const Icon = status === "road_ready" ? ShieldCheck : status === "restricted_use" ? AlertTriangle : XOctagon;
  return (
    <View style={[styles.badge, { backgroundColor: meta.soft, borderColor: meta.color }]}>
      <Icon color={meta.color} size={compact ? 12 : 14} />
      {!compact && <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>}
      <Text style={[styles.badgeChip, { color: meta.color, borderColor: meta.color }]}>{meta.badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, alignSelf: "flex-start",
  },
  label: { fontSize: 12, fontWeight: "700" },
  badgeChip: {
    fontSize: 9, fontWeight: "900", letterSpacing: 1.2,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    borderWidth: 1,
  },
});
