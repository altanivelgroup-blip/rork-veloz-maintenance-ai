import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { statusMeta, type StatusKey } from "@/constants/colors";

export default function StatusBadge({ status, compact = false }: { status: StatusKey; compact?: boolean }) {
  const meta = statusMeta[status];
  return (
    <View style={[styles.wrap, { backgroundColor: meta.soft, borderColor: meta.color + "55" }]}>
      <View style={[styles.dot, { backgroundColor: meta.dot }]} />
      {!compact && <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: { width: 7, height: 7, borderRadius: 99 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
