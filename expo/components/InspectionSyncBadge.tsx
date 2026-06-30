import { Clock, ShieldAlert, ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getInspectionStatus } from "@/constants/mockData";

type Props = { lastInspectionAt?: string; lastInspectionResult?: "pass" | "fail" | "flagged"; compact?: boolean };

/**
 * Pre-Trip Validation Hook badge. Shows last-inspection timestamp
 * and auto-calculates expiration (24-hour window).
 */
export default function InspectionSyncBadge({ lastInspectionAt, lastInspectionResult, compact }: Props) {
  const { expired, label, hoursAgo } = getInspectionStatus(lastInspectionAt);
  const isFail = lastInspectionResult === "fail";
  const isFlagged = lastInspectionResult === "flagged";

  if (!lastInspectionAt) {
    return (
      <View style={[styles.badge, { backgroundColor: "rgba(255,84,112,0.14)", borderColor: "rgba(255,84,112,0.4)" }]}>
        <ShieldAlert color="#FF5470" size={14} />
        <Text style={[styles.label, { color: "#FF5470" }]}>Never Inspected</Text>
      </View>
    );
  }

  const isWarning = expired || isFail || isFlagged;
  const bg = isWarning ? "rgba(255,84,112,0.14)" : hoursAgo < 6 ? "rgba(34,211,153,0.14)" : "rgba(255,181,71,0.14)";
  const border = isWarning ? "rgba(255,84,112,0.4)" : hoursAgo < 6 ? "rgba(34,211,153,0.4)" : "rgba(255,181,71,0.4)";
  const col = isWarning ? "#FF5470" : hoursAgo < 6 ? "#22D399" : "#FFB547";
  const Icon = isFail || expired ? ShieldAlert : isFlagged ? ShieldAlert : ShieldCheck;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Icon color={col} size={compact ? 12 : 14} />
      {!compact && (
        <>
          <Text style={[styles.label, { color: col }]}>{label}</Text>
          {lastInspectionResult && (
            <Text style={[styles.resultChip, {
              color: lastInspectionResult === "pass" ? "#22D399" : lastInspectionResult === "flagged" ? "#FFB547" : "#FF5470",
              borderColor: lastInspectionResult === "pass" ? "rgba(34,211,153,0.5)" : lastInspectionResult === "flagged" ? "rgba(255,181,71,0.5)" : "rgba(255,84,112,0.5)",
            }]}>
              {lastInspectionResult.toUpperCase()}
            </Text>
          )}
        </>
      )}
      {compact && <Clock color={col} size={10} style={{ marginLeft: 2 }} />}
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
  resultChip: {
    fontSize: 9, fontWeight: "900", letterSpacing: 1,
    paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4,
    borderWidth: 1,
  },
});
