import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AlertTriangle, ArrowRight, Calendar, ChevronRight, DollarSign, Gauge, Settings, ShieldCheck, Wrench } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import { Colors } from "@/constants/colors";
import { serviceUrgencyMeta } from "@/constants/mockData";
import type { ServiceUrgency } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";

export default function MaintenanceDashboard() {
  const { maintenanceHealth, upcomingServices, costPerMileByClass } = useFleet();

  const urgencyCounts = {
    critical: maintenanceHealth.criticalLockouts,
    overdue: maintenanceHealth.allUrgencies.filter((u) => u.urgency === "overdue").length,
    dueSoon: maintenanceHealth.allUrgencies.filter((u) => u.urgency === "due_soon").length,
  };

  return (
    <>
      {/* Maintenance Health Ticker */}
      <View style={styles.tickerRow}>
        <TickerCard
          icon={<Wrench color={Colors.amber} size={18} />}
          label="In Shop"
          value={String(maintenanceHealth.inShop)}
          color={Colors.amber}
        />
        <TickerCard
          icon={<AlertTriangle color={Colors.urgencyAmber} size={18} />}
          label="Service Due"
          value={String(maintenanceHealth.serviceDue)}
          color={Colors.amber}
        />
        <TickerCard
          icon={<Settings color={Colors.red} size={18} />}
          label="Out of Service"
          value={String(maintenanceHealth.outOfService)}
          color={Colors.red}
        />
        <TickerCard
          icon={<ShieldCheck color={Colors.urgencyBlinkRed} size={18} />}
          label="Critical"
          value={String(maintenanceHealth.criticalLockouts)}
          color={Colors.urgencyBlinkRed}
          blink
        />
      </View>

      {/* Urgency breakdown bar */}
      <View style={styles.urgencyBar}>
        {urgencyCounts.critical > 0 && (
          <View style={[styles.urgencySeg, { flex: urgencyCounts.critical, backgroundColor: Colors.urgencyBlinkRed }]} />
        )}
        {urgencyCounts.overdue > 0 && (
          <View style={[styles.urgencySeg, { flex: urgencyCounts.overdue, backgroundColor: Colors.red }]} />
        )}
        {urgencyCounts.dueSoon > 0 && (
          <View style={[styles.urgencySeg, { flex: urgencyCounts.dueSoon, backgroundColor: Colors.amber }]} />
        )}
      </View>
      <View style={styles.urgencyLegend}>
        {urgencyCounts.critical > 0 && <LegendDot color={Colors.urgencyBlinkRed} label={`${urgencyCounts.critical} critical`} />}
        {urgencyCounts.overdue > 0 && <LegendDot color={Colors.red} label={`${urgencyCounts.overdue} overdue`} />}
        {urgencyCounts.dueSoon > 0 && <LegendDot color={Colors.amber} label={`${urgencyCounts.dueSoon} due soon`} />}
      </View>

      {/* Upcoming Services */}
      {upcomingServices.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={styles.sectionHead}>
            <Calendar color={Colors.cyan} size={14} />
            <Text style={styles.sectionTitle}>Upcoming Services</Text>
            <Text style={styles.sectionCount}>{upcomingServices.length}</Text>
          </View>
          <View style={{ gap: 6 }}>
            {upcomingServices.slice(0, 5).map((svc, idx) => {
              const meta = serviceUrgencyMeta[svc.urgency as ServiceUrgency];
              return (
                <Pressable key={`${svc.assetId}-${svc.level}-${idx}`} onPress={() => router.push(`/${svc.assetKind}/${svc.assetId}` as never)}>
                  <View style={styles.svcCard}>
                    <View style={[styles.svcDot, { backgroundColor: meta.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.svcAsset}>{svc.assetName}</Text>
                      <Text style={styles.svcLabel}>{svc.label}</Text>
                    </View>
                    <View style={styles.svcMeta}>
                      {svc.remainingDays >= 0 && svc.remainingDays <= 30 && (
                        <Text style={[styles.svcDays, { color: svc.urgency === "critical_lockout" ? Colors.urgencyBlinkRed : svc.urgency === "overdue" ? Colors.red : Colors.amber }]}>
                          {svc.remainingDays <= 0 ? "OVERDUE" : `${svc.remainingDays}d`}
                        </Text>
                      )}
                    </View>
                    <ChevronRight color={Colors.textDim} size={14} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Cost per mile */}
      <View style={{ marginTop: 12 }}>
        <View style={styles.sectionHead}>
          <DollarSign color={Colors.cyan} size={14} />
          <Text style={styles.sectionTitle}>Maintenance Cost / Mile</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={styles.cpmCard}>
            <Gauge color={Colors.cyan} size={16} />
            <Text style={styles.cpmLabel}>Trucks</Text>
            <Text style={styles.cpmValue}>${costPerMileByClass.truck.toFixed(3)}</Text>
            <Text style={styles.cpmSub}>per mile avg</Text>
          </View>
          <View style={styles.cpmCard}>
            <Gauge color={Colors.electric} size={16} />
            <Text style={styles.cpmLabel}>Trailers</Text>
            <Text style={styles.cpmValue}>${costPerMileByClass.trailer.toFixed(3)}</Text>
            <Text style={styles.cpmSub}>per mile avg</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function TickerCard({ icon, label, value, color, blink }: { icon: React.ReactNode; label: string; value: string; color: string; blink?: boolean }) {
  return (
    <View style={[styles.ticker, { borderColor: `${color}30` }]}>
      <LinearGradient
        colors={[`${color}14`, "rgba(5,11,24,0.6)"]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tickerBorder, { borderColor: `${color}18` }]} pointerEvents="none" />
      <View style={{ gap: 4, alignItems: "center" }}>
        {icon}
        <Text style={[styles.tickerValue, { color }]}>{value}</Text>
        <Text style={styles.tickerLabel}>{label}</Text>
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tickerRow: { flexDirection: "row", gap: 8 },
  ticker: {
    flex: 1, paddingVertical: 12, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, position: "relative",
  },
  tickerBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 14, borderWidth: 1 },
  tickerValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  tickerLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  urgencyBar: { flexDirection: "row", height: 4, borderRadius: 2, overflow: "hidden", gap: 1, marginTop: 10 },
  urgencySeg: { height: "100%", borderRadius: 1 },
  urgencyLegend: { flexDirection: "row", gap: 14, marginTop: 6 },
  legend: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 99 },
  legendText: { color: Colors.textDim, fontSize: 10, fontWeight: "600" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
  sectionCount: { color: Colors.textDim, fontSize: 12, fontWeight: "700" },
  svcCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1, borderColor: Colors.border,
  },
  svcDot: { width: 10, height: 10, borderRadius: 99 },
  svcAsset: { color: Colors.text, fontSize: 13, fontWeight: "700" },
  svcLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  svcMeta: { alignItems: "flex-end" },
  svcDays: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  cpmCard: {
    flex: 1, alignItems: "center", padding: 14, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: Colors.border,
  },
  cpmLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 6, textTransform: "uppercase" },
  cpmValue: { color: Colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5, marginTop: 4 },
  cpmSub: { color: Colors.textDim, fontSize: 9, marginTop: 2 },
});
