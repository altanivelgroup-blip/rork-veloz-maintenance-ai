import { DollarSign, Droplets, TrendingUp, Wrench } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import { Colors, Gradients } from "@/constants/colors";
import type { CPMBreakdown } from "@/lib/cpmAccounting";

type Props = {
  fleetCPM: CPMBreakdown;
  selectedTimeframe: string;
};

export default function CPMBreakdownChart({ fleetCPM, selectedTimeframe }: Props) {
  const { fuelCpm, driverPayCpm, maintenanceCpm, operatingCpm, totalMilesDriven } = fleetCPM;
  const total = operatingCpm > 0 ? operatingCpm : 1;
  const fuelPct = Math.round((fuelCpm / total) * 100);
  const driverPct = Math.round((driverPayCpm / total) * 100);
  const maintPct = 100 - fuelPct - driverPct;

  const formatCpm = (n: number) => `$${n.toFixed(3)}`;

  return (
    <Card gradient={Gradients.cardHi} style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>OPERATING CPM BLUEPRINT</Text>
          <Text style={styles.title}>Cost Per Mile Breakdown</Text>
          <Text style={styles.sub}>{selectedTimeframe} · {totalMilesDriven.toLocaleString()} miles driven</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>TOTAL CPM</Text>
          <Text style={styles.totalValue}>{formatCpm(operatingCpm)}</Text>
        </View>
      </View>

      {/* Stacked horizontal bar */}
      <View style={styles.barWrap}>
        <View style={styles.stackedBar}>
          {fuelPct > 0 && (
            <View style={[styles.barSegment, { flex: fuelPct, backgroundColor: Colors.cyan }]} />
          )}
          {driverPct > 0 && (
            <View style={[styles.barSegment, { flex: driverPct, backgroundColor: Colors.electric }]} />
          )}
          {maintPct > 0 && (
            <View style={[styles.barSegment, { flex: maintPct, backgroundColor: Colors.amber }]} />
          )}
        </View>
      </View>

      {/* Legend / breakdown rows */}
      <View style={styles.legend}>
        <LegendRow
          icon={<Droplets size={14} color={Colors.cyan} />}
          color={Colors.cyan}
          label="Fuel CPM"
          value={formatCpm(fuelCpm)}
          pct={fuelPct}
        />
        <LegendRow
          icon={<TrendingUp size={14} color={Colors.electric} />}
          color={Colors.electric}
          label="Driver Pay CPM"
          value={formatCpm(driverPayCpm)}
          pct={driverPct}
        />
        <LegendRow
          icon={<Wrench size={14} color={Colors.amber} />}
          color={Colors.amber}
          label="Maintenance CPM"
          value={formatCpm(maintenanceCpm)}
          pct={maintPct}
        />
      </View>

      {/* Total spend summary */}
      <View style={styles.spendRow}>
        <SpendChip
          icon={<Droplets size={12} color={Colors.cyan} />}
          label="Fuel"
          value={`$${fleetCPM.totalFuelSpend.toLocaleString()}`}
        />
        <SpendChip
          icon={<DollarSign size={12} color={Colors.electric} />}
          label="Driver Pay"
          value={`$${fleetCPM.totalDriverPay.toLocaleString()}`}
        />
        <SpendChip
          icon={<Wrench size={12} color={Colors.amber} />}
          label="Maintenance"
          value={`$${fleetCPM.totalMaintenanceCost.toLocaleString()}`}
        />
      </View>
    </Card>
  );
}

function LegendRow({
  icon,
  color,
  label,
  value,
  pct,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      {icon}
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={[styles.legendValue, { color }]}>{value}</Text>
      <Text style={styles.legendPct}>{pct}%</Text>
    </View>
  );
}

function SpendChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.spendChip}>
      {icon}
      <Text style={styles.spendLabel}>{label}</Text>
      <Text style={styles.spendValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    paddingTop: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sub: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 3,
  },
  totalBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  totalLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  totalValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  barWrap: {
    marginBottom: 12,
  },
  stackedBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  barSegment: {
    minWidth: 2,
  },
  legend: {
    gap: 8,
    marginBottom: 14,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  legendPct: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "right",
  },
  spendRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  spendChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spendLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 4,
    textTransform: "uppercase",
  },
  spendValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
});
