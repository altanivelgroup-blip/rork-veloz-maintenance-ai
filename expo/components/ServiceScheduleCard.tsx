import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, Calendar, CheckCircle, Clock, Gauge, ShieldAlert, Wrench } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import { Colors } from "@/constants/colors";
import { serviceUrgencyMeta, type ServiceScheduleConfig, type ServiceUrgency } from "@/constants/mockData";

type Props = {
  schedule: ServiceScheduleConfig;
  urgency: ServiceUrgency;
  remainingMiles: number;
  remainingDays: number;
  nextDue: string;
};

export default function ServiceScheduleCard({ schedule, urgency, remainingMiles, remainingDays, nextDue }: Props) {
  const meta = serviceUrgencyMeta[urgency];
  const isOverdue = urgency === "overdue" || urgency === "critical_lockout";
  const isSoon = urgency === "due_soon";
  const isCurrent = urgency === "current";

  return (
    <Card
      gradient={isOverdue ? ["rgba(255,51,102,0.18)", "rgba(255,51,102,0.04)"] as readonly [string, string] : isSoon ? ["rgba(255,181,71,0.14)", "rgba(255,181,71,0.03)"] as readonly [string, string] : undefined}
      glow={isOverdue}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={[styles.levelBadge, { backgroundColor: `${meta.color}22`, borderColor: meta.color }]}>
          <Text style={[styles.levelText, { color: meta.color }]}>{schedule.level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{schedule.label}</Text>
          <Text style={styles.desc}>{schedule.description}</Text>
        </View>
        <View style={[styles.urgencyPill, { backgroundColor: meta.soft, borderColor: meta.color }]}>
          {isOverdue ? (
            <ShieldAlert color={meta.color} size={12} />
          ) : isSoon ? (
            <Clock color={meta.color} size={12} />
          ) : (
            <CheckCircle color={meta.color} size={12} />
          )}
          <Text style={[styles.urgencyText, { color: meta.color }]}>{meta.badge}</Text>
        </View>
      </View>

      {/* Trigger indicators */}
      <View style={styles.triggerRow}>
        {/* Mileage trigger */}
        {remainingMiles >= 0 && (
          <View style={styles.trigger}>
            <Gauge color={isOverdue ? Colors.urgencyBlinkRed : isSoon ? Colors.amber : Colors.textMuted} size={14} />
            <View>
              <Text style={styles.triggerLabel}>MILEAGE</Text>
              <Text style={[styles.triggerValue, {
                color: remainingMiles <= 0 ? Colors.urgencyBlinkRed : remainingMiles <= 1000 ? Colors.amber : Colors.green,
              }]}>
                {remainingMiles <= 0
                  ? `Overdue ${Math.abs(remainingMiles).toLocaleString()} mi`
                  : remainingMiles <= 1000
                    ? `${remainingMiles.toLocaleString()} mi remaining`
                    : `${remainingMiles.toLocaleString()} mi to go`}
              </Text>
            </View>
          </View>
        )}

        {/* Time trigger */}
        {remainingDays >= 0 && (
          <View style={styles.trigger}>
            <Calendar color={isOverdue ? Colors.urgencyBlinkRed : isSoon ? Colors.amber : Colors.textMuted} size={14} />
            <View>
              <Text style={styles.triggerLabel}>TIME</Text>
              <Text style={[styles.triggerValue, {
                color: remainingDays <= 0 ? Colors.urgencyBlinkRed : remainingDays <= 14 ? Colors.amber : Colors.green,
              }]}>
                {remainingDays <= 0
                  ? `Overdue ${Math.abs(remainingDays)} days`
                  : remainingDays <= 14
                    ? `${remainingDays} days remaining`
                    : `${remainingDays} days to go`}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Next due indicator */}
      {nextDue !== "none" && (
        <View style={styles.nextDueRow}>
          <AlertTriangle color={meta.color} size={12} />
          <Text style={[styles.nextDueText, { color: meta.color }]}>
            Due next by: <Text style={{ fontWeight: "800" }}>{nextDue}</Text>
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  levelBadge: {
    width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  levelText: { fontSize: 13, fontWeight: "900", letterSpacing: -0.3 },
  label: { color: Colors.text, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  desc: { color: Colors.textMuted, fontSize: 11, marginTop: 2, lineHeight: 15 },
  urgencyPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1,
  },
  urgencyText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  triggerRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  trigger: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  triggerLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  triggerValue: { fontSize: 12, fontWeight: "800", marginTop: 2 },
  nextDueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  nextDueText: { fontSize: 11, fontWeight: "600" },
});
