import { CheckCircle, Clock, Route, Wrench } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { availabilityMeta } from "@/constants/mockData";
import type { AvailabilityState } from "@/constants/mockData";

type Props = { state: AvailabilityState; compact?: boolean };

/** Dynamic Availability Matrix badge — Available / Assigned / In Shop / Staged. */
export default function AvailabilityBadge({ state, compact }: Props) {
  const meta = availabilityMeta[state];
  const Icon =
    state === "available" ? CheckCircle
    : state === "assigned" ? Route
    : state === "in_shop" ? Wrench
    : Clock;
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}1a`, borderColor: `${meta.color}40` }]}>
      <Icon color={meta.color} size={compact ? 12 : 14} />
      {!compact && <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, alignSelf: "flex-start",
  },
  label: { fontSize: 11, fontWeight: "700" },
});
