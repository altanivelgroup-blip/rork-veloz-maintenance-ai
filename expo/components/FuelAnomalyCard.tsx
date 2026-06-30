import { AlertTriangle, Droplets, Flame, MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { FuelTransaction, FuelFraudFlag } from "@/constants/mockData";

const flagIcon = {
  capacity_exceeded: Droplets,
  location_mismatch: MapPin,
  rapid_consumption: Flame,
} as const;

const flagColor = {
  high: Colors.red,
  medium: Colors.amber,
} as const;

type Props = {
  transaction: FuelTransaction & { flagged: FuelFraudFlag };
};

export default function FuelAnomalyCard({ transaction }: Props) {
  const flag = transaction.flagged!;
  const Icon = flagIcon[flag.type] ?? AlertTriangle;
  const accentColor = flagColor[flag.severity] ?? Colors.amber;

  return (
    <View style={[styles.wrap, { borderColor: accentColor + "40" }]}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: accentColor + "20" }]}>
          <Icon size={16} color={accentColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.type}>{flag.type === "capacity_exceeded" ? "Capacity Exceeded" : flag.type === "location_mismatch" ? "Location Mismatch" : "Rapid Consumption"}</Text>
          <Text style={[styles.severity, { color: accentColor }]}>
            {flag.severity === "high" ? "HIGH PRIORITY" : "MEDIUM PRIORITY"}
          </Text>
        </View>
      </View>

      {/* Detail */}
      <Text style={styles.detail}>{flag.detail}</Text>

      {/* Meta row */}
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {transaction.assetName} — {transaction.driverName}
        </Text>
        <Text style={styles.metaText}>
          {transaction.vendorName} · {transaction.gallonsPumped.toFixed(1)} gal · ${transaction.totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(transaction.authTimestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(255,51,102,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,84,112,0.2)",
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  type: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  severity: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginTop: 2,
  },
  detail: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  meta: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  metaText: {
    color: Colors.textDim,
    fontSize: 11,
    marginBottom: 2,
  },
  timestamp: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
});
