import { ArrowDown, ArrowUp, Droplets, DollarSign, Gauge, Minus, TrendingUp } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import { Colors, Gradients } from "@/constants/colors";
import type { FuelTransaction, Truck } from "@/constants/mockData";
import type { CPMBreakdown, TimeframeKey } from "@/lib/cpmAccounting";
import { useFleet } from "@/providers/FleetProvider";

type Props = {
  truck: Truck;
};

export default function TruckFuelTab({ truck }: Props) {
  const {
    getFuelTransactions,
    getRollingMPG,
    getTruckCPM,
    getCPMShare,
  } = useFleet();

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("30d");

  const transactions = useMemo(() => getFuelTransactions(truck.id), [getFuelTransactions, truck.id]);
  const rollingMpg = useMemo(() => getRollingMPG(truck.id), [getRollingMPG, truck.id]);
  const cpmBreakdown = useMemo(
    () => getTruckCPM(truck.id, selectedTimeframe),
    [getTruckCPM, truck.id, selectedTimeframe],
  );
  const cpmProps = useMemo(() => getCPMShare(cpmBreakdown), [getCPMShare, cpmBreakdown]);

  const baselineMpg = truck.avgMpg;
  const dropPct = baselineMpg > 0 ? Math.round(((baselineMpg - rollingMpg.mpg) / baselineMpg) * 100) : 0;
  const isDegraded = rollingMpg.mpg > 0 && dropPct > 15;

  // Last 10 fills for MPG tracker
  const last10Fills = useMemo(() => {
    const diesel = transactions
      .filter((t) => t.fuelType === "diesel")
      .sort((a, b) => new Date(a.authTimestamp).getTime() - new Date(b.authTimestamp).getTime());
    return diesel.slice(-10);
  }, [transactions]);

  const mpgData = useMemo(() => {
    const points: { label: string; mpg: number; gallons: number }[] = [];
    for (let i = 1; i < last10Fills.length; i++) {
      const miles = last10Fills[i].odometerAtFill - last10Fills[i - 1].odometerAtFill;
      const gallons = last10Fills[i].gallonsPumped;
      const mpg = gallons > 0 ? Math.round((miles / gallons) * 10) / 10 : 0;
      if (mpg > 0 && mpg < 30) {
        points.push({
          label: new Date(last10Fills[i].authTimestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          mpg,
          gallons,
        });
      }
    }
    return points;
  }, [last10Fills]);

  const maxMpg = Math.max(baselineMpg, ...mpgData.map((p) => p.mpg), 5);

  const formatCpm = (n: number) => `$${n.toFixed(3)}`;
  const timeframeLabels: Record<TimeframeKey, string> = { "7d": "7D", "30d": "30D", "90d": "90D" };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Fleet Benchmarking Alert */}
      {isDegraded && (
        <View style={styles.degradedBanner}>
          <TrendingUp size={18} color={Colors.amber} style={{ transform: [{ rotate: "135deg" }] }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.degradedTitle}>Performance Anomaly Detected</Text>
            <Text style={styles.degradedDesc}>
              Current efficiency is {dropPct}% below baseline ({rollingMpg.mpg.toFixed(1)} vs {baselineMpg.toFixed(1)} MPG). Check air filters, tire pressure, or fuel injectors.
            </Text>
          </View>
        </View>
      )}

      {/* MPG Tracker Card */}
      <Card gradient={Gradients.cardHi} style={{ marginBottom: 10 }}>
        <Text style={styles.kicker}>MPG TRACKER</Text>
        <View style={styles.mpgHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mpgCurrent}>{rollingMpg.mpg > 0 ? rollingMpg.mpg.toFixed(1) : "—"}</Text>
            <Text style={styles.mpgLabel}>Current MPG</Text>
            <View style={styles.trendRow}>
              {rollingMpg.trend === "up" ? (
                <ArrowUp size={10} color={Colors.green} />
              ) : rollingMpg.trend === "down" ? (
                <ArrowDown size={10} color={Colors.amber} />
              ) : (
                <Minus size={10} color={Colors.textDim} />
              )}
              <Text style={[styles.trendText, {
                color: rollingMpg.trend === "up" ? Colors.green : rollingMpg.trend === "down" ? Colors.amber : Colors.textDim,
              }]}>
                {rollingMpg.trend === "up" ? "Rising" : rollingMpg.trend === "down" ? "Falling" : "Stable"}
              </Text>
            </View>
          </View>
          <View style={styles.baselineBox}>
            <Text style={styles.baselineLabel}>BASELINE</Text>
            <Text style={styles.baselineValue}>{baselineMpg.toFixed(1)}</Text>
            <Text style={[styles.baselineDelta, { color: isDegraded ? Colors.red : Colors.green }]}>
              {isDegraded ? `-${dropPct}%` : rollingMpg.mpg > baselineMpg ? `+${Math.abs(dropPct)}%` : "On track"}
            </Text>
          </View>
        </View>

        {/* Mini sparkline bar chart */}
        <View style={styles.chartWrap}>
          <View style={styles.chartArea}>
            {/* Baseline reference line */}
            <View style={[styles.baselineRef, { bottom: `${Math.round((baselineMpg / maxMpg) * 100)}%` }]}>
              <Text style={styles.baselineRefText}>{baselineMpg.toFixed(1)}</Text>
            </View>
            {/* Bar chart */}
            <View style={styles.bars}>
              {mpgData.map((point, i) => {
                const heightPct = Math.max(4, Math.round((point.mpg / maxMpg) * 100));
                const isLast = i === mpgData.length - 1;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.bar, {
                      height: `${heightPct}%`,
                      backgroundColor: point.mpg >= baselineMpg ? Colors.green : point.mpg >= baselineMpg * 0.85 ? Colors.amber : Colors.red,
                      opacity: isLast ? 1 : 0.7,
                    }]} />
                    <Text style={styles.barLabel}>{point.label}</Text>
                  </View>
                );
              })}
              {mpgData.length === 0 && (
                <Text style={styles.noDataText}>Not enough fill data for MPG chart</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.chartCaption}>
          Last {mpgData.length} fills · MPG vs {baselineMpg.toFixed(1)} baseline
        </Text>
      </Card>

      {/* CPM Breakdown for this truck */}
      <Card gradient={Gradients.cardHi} style={{ marginBottom: 10 }}>
        <View style={styles.cpmHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>OPERATING CPM</Text>
            <Text style={styles.cpmTotal}>{formatCpm(cpmBreakdown.operatingCpm)}</Text>
            <Text style={styles.cpmSub}>
              {cpmBreakdown.totalMilesDriven.toLocaleString()} miles driven
            </Text>
          </View>
          {/* Timeframe selector */}
          <View style={styles.tfRow}>
            {(["7d", "30d", "90d"] as TimeframeKey[]).map((tf) => (
              <Pressable
                key={tf}
                onPress={() => setSelectedTimeframe(tf)}
                style={[
                  styles.tfChip,
                  selectedTimeframe === tf && styles.tfChipActive,
                ]}
              >
                <Text style={[
                  styles.tfText,
                  selectedTimeframe === tf && styles.tfTextActive,
                ]}>
                  {timeframeLabels[tf]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {/* Stacked bar */}
        <View style={styles.cpmBarWrap}>
          <View style={styles.cpmBar}>
            {cpmProps.fuelPct > 0 && (
              <View style={[styles.cpmSeg, { flex: cpmProps.fuelPct, backgroundColor: Colors.cyan }]} />
            )}
            {cpmProps.driverPayPct > 0 && (
              <View style={[styles.cpmSeg, { flex: cpmProps.driverPayPct, backgroundColor: Colors.electric }]} />
            )}
            {cpmProps.maintenancePct > 0 && (
              <View style={[styles.cpmSeg, { flex: cpmProps.maintenancePct, backgroundColor: Colors.amber }]} />
            )}
          </View>
        </View>
        <View style={styles.cpmLegend}>
          <CpmRow color={Colors.cyan} label="Fuel CPM" value={formatCpm(cpmBreakdown.fuelCpm)} />
          <CpmRow color={Colors.electric} label="Driver Pay CPM" value={formatCpm(cpmBreakdown.driverPayCpm)} />
          <CpmRow color={Colors.amber} label="Maintenance CPM" value={formatCpm(cpmBreakdown.maintenanceCpm)} />
        </View>
      </Card>

      {/* Historical Transaction Log */}
      <Card gradient={Gradients.cardHi}>
        <Text style={styles.kicker}>TRANSACTION LOG</Text>
        <Text style={styles.sectionTitle}>Fuel Purchase History</Text>
        <Text style={styles.sectionSub}>{transactions.length} transactions</Text>

        {transactions.slice(0, 20).map((tx, i) => (
          <View key={tx.transactionId}>
            <View style={styles.txRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.txVendor}>{tx.vendorName}</Text>
                <Text style={styles.txMeta}>
                  {new Date(tx.authTimestamp).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                  {" · "}{tx.odometerAtFill.toLocaleString()} mi
                </Text>
              </View>
              <View style={styles.txStats}>
                <View style={styles.txStat}>
                  <Droplets size={10} color={Colors.cyan} />
                  <Text style={styles.txStatText}>{tx.gallonsPumped.toFixed(1)} gal</Text>
                </View>
                <View style={styles.txStat}>
                  <DollarSign size={10} color={Colors.green} />
                  <Text style={styles.txStatText}>${tx.totalAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.txStat}>
                  <Gauge size={10} color={Colors.textDim} />
                  <Text style={styles.txStatText}>${tx.pricePerGallon.toFixed(2)}/gal</Text>
                </View>
              </View>
              {tx.flagged && (
                <View style={[styles.txFlag, { backgroundColor: tx.flagged.severity === "high" ? Colors.redSoft : Colors.amberSoft }]}>
                  <Text style={[styles.txFlagText, { color: tx.flagged.severity === "high" ? Colors.red : Colors.amber }]}>
                    !
                  </Text>
                </View>
              )}
            </View>
            {i < Math.min(transactions.length - 1, 19) && <View style={styles.txDivider} />}
          </View>
        ))}
        {transactions.length === 0 && (
          <Text style={styles.noDataText}>No fuel transactions recorded for this truck.</Text>
        )}
      </Card>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function CpmRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={cpmRowStyles.row}>
      <View style={[cpmRowStyles.dot, { backgroundColor: color }]} />
      <Text style={cpmRowStyles.label}>{label}</Text>
      <Text style={[cpmRowStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const cpmRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  value: {
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});

const styles = StyleSheet.create({
  kicker: {
    color: Colors.cyan,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionSub: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },

  // Degradation alert
  degradedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,181,71,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,181,71,0.3)",
    marginBottom: 10,
  },
  degradedTitle: {
    color: Colors.amber,
    fontSize: 13,
    fontWeight: "800",
  },
  degradedDesc: {
    color: "rgba(255,200,130,0.8)",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  // MPG header
  mpgHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  mpgCurrent: {
    color: Colors.cyan,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  mpgLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: -2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  baselineBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  baselineLabel: {
    color: Colors.textDim,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  baselineValue: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  baselineDelta: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },

  // Chart
  chartWrap: {
    marginTop: 16,
    marginBottom: 6,
  },
  chartArea: {
    height: 120,
    position: "relative",
  },
  baselineRef: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderStyle: "dashed",
    zIndex: 1,
  },
  baselineRefText: {
    position: "absolute",
    right: 0,
    top: -8,
    color: Colors.textDim,
    fontSize: 8,
    fontWeight: "700",
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    paddingHorizontal: 2,
  },
  bar: {
    width: "100%",
    maxWidth: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: Colors.textDim,
    fontSize: 7,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  chartCaption: {
    color: Colors.textDim,
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.6,
  },

  // CPM
  cpmHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cpmTotal: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  cpmSub: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  tfRow: {
    flexDirection: "row",
    gap: 4,
  },
  tfChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tfChipActive: {
    backgroundColor: Colors.cyan + "20",
    borderColor: Colors.cyan + "60",
  },
  tfText: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
  },
  tfTextActive: {
    color: Colors.cyan,
  },
  cpmBarWrap: {
    marginTop: 14,
    marginBottom: 10,
  },
  cpmBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cpmSeg: {
    minWidth: 2,
  },
  cpmLegend: {
    gap: 6,
  },

  // Transaction log
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  txVendor: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  txMeta: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  txStats: {
    alignItems: "flex-end",
    gap: 2,
    marginRight: 8,
  },
  txStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  txStatText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  txFlag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  txFlagText: {
    fontSize: 12,
    fontWeight: "900",
  },
  txDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  noDataText: {
    color: Colors.textDim,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 20,
  },
});
