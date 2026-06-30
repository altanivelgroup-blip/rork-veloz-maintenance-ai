import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, ArrowDown, ArrowUp, DollarSign, Droplets, Fuel, Gauge, Minus, ShieldAlert } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import FuelAnomalyCard from "@/components/FuelAnomalyCard";
import FuelEfficiencyRow from "@/components/FuelEfficiencyRow";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

export default function FuelScreen() {
  const { fuelSummary, fuelEfficiencyRanking, fuelAnomalies } = useFleet();

  const weekTrend = useMemo(() => {
    const prev = fuelSummary.weekSpend > 2000 ? "up" : "down";
    return prev as "up" | "down" | "stable";
  }, [fuelSummary.weekSpend]);

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>FINANCIALS · ANALYTICS</Text>
          <Text style={styles.h1}>Fuel Intelligence</Text>
          <Text style={styles.sub}>
            Real-time fleet fuel economy ·{" "}
            {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </Text>
        </View>
        <View style={[styles.liveDot, { backgroundColor: Colors.cyan + "20" }]}>
          <View style={[styles.liveDotInner, { backgroundColor: Colors.cyan }]} />
          <Text style={[styles.liveText, { color: Colors.cyan }]}>ACTIVE</Text>
        </View>
      </View>

      {/* Fleet MPG Ticker — horizontal summary cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tickerRow}
        style={{ marginBottom: 6 }}
      >
        {/* Fleet Average MPG */}
        <Card gradient={Gradients.cardHi} style={styles.tickerCard}>
          <View style={styles.tickerIcon}>
            <Gauge size={18} color={Colors.cyan} />
          </View>
          <Text style={styles.tickerValue}>{fuelSummary.fleetAvgMpg.toFixed(1)}</Text>
          <Text style={styles.tickerLabel}>Avg Fleet MPG</Text>
          <View style={styles.tickerSub}>
            {weekTrend === "up" ? (
              <ArrowUp size={10} color={Colors.green} />
            ) : weekTrend === "down" ? (
              <ArrowDown size={10} color={Colors.amber} />
            ) : (
              <Minus size={10} color={Colors.textDim} />
            )}
            <Text style={[styles.tickerTrend, { color: weekTrend === "up" ? Colors.green : Colors.amber }]}>
              vs. prior week
            </Text>
          </View>
        </Card>

        {/* Total Gallons This Week */}
        <Card gradient={Gradients.cardHi} style={styles.tickerCard}>
          <View style={styles.tickerIcon}>
            <Droplets size={18} color={Colors.electric} />
          </View>
          <Text style={styles.tickerValue}>
            {fuelSummary.weekGallons.toLocaleString()}
          </Text>
          <Text style={styles.tickerLabel}>Gallons This Week</Text>
          <Text style={styles.tickerSubText}>
            {fuelSummary.totalTransactions} transactions total
          </Text>
        </Card>

        {/* Total Fuel Spend */}
        <Card gradient={Gradients.cardHi} style={styles.tickerCard}>
          <View style={styles.tickerIcon}>
            <DollarSign size={18} color={Colors.green} />
          </View>
          <Text style={styles.tickerValue}>{formatCurrency(fuelSummary.weekSpend)}</Text>
          <Text style={styles.tickerLabel}>Fuel Spend This Week</Text>
          <Text style={styles.tickerSubText}>
            Avg ${fuelSummary.avgPricePerGallon.toFixed(2)}/gal
          </Text>
        </Card>

        {/* All-time spend */}
        <Card gradient={Gradients.cardHi} style={styles.tickerCard}>
          <View style={styles.tickerIcon}>
            <Fuel size={18} color={Colors.amber} />
          </View>
          <Text style={styles.tickerValue}>{formatCurrency(fuelSummary.totalSpend)}</Text>
          <Text style={styles.tickerLabel}>Total Fuel YTD</Text>
          <Text style={styles.tickerSubText}>
            {fuelSummary.totalGallons.toLocaleString()} gal consumed
          </Text>
        </Card>
      </ScrollView>

      {/* Anomalous Fuel Exception Panel */}
      {fuelAnomalies.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <SectionHeader
            title="Anomaly Detection"
            kicker={`${fuelAnomalies.length} FLAGGED TRANSACTIONS`}
            right={
              <View style={styles.alertBadge}>
                <ShieldAlert size={12} color={Colors.red} />
                <Text style={styles.alertBadgeText}>{fuelAnomalies.length}</Text>
              </View>
            }
          />
          {fuelAnomalies.map((tx) => (
            <FuelAnomalyCard key={tx.transactionId} transaction={tx as any} />
          ))}
        </View>
      )}

      {/* Fuel Efficiency Grid — trucks sorted by MPG */}
      <SectionHeader
        title="Efficiency Ranking"
        kicker="MPG LEADERBOARD · ALL TRUCKS"
        right={
          <View style={styles.gridLabel}>
            <Text style={styles.gridLabelText}>
              {fuelEfficiencyRanking.length} trucks
            </Text>
          </View>
        }
      />

      {fuelEfficiencyRanking.map((row, i) => (
        <FuelEfficiencyRow
          key={row.truckId}
          truckName={row.truckName}
          make={row.make}
          model={row.model}
          currentMpg={row.currentMpg}
          mpgTrend={row.mpgTrend}
          baselineMpg={row.baselineMpg}
          degraded={row.degraded}
          degradationAlert={row.degradationAlert}
          rank={i + 1}
        />
      ))}

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingTop: 4,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 10,
    letterSpacing: 2.4,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  h1: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  sub: {
    color: Colors.textDim,
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  liveDot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
    marginRight: 6,
  },
  liveText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  // Ticker cards
  tickerRow: {
    paddingRight: 16,
    gap: 10,
  },
  tickerCard: {
    width: 164,
    paddingTop: 4,
  },
  tickerIcon: {
    marginBottom: 8,
  },
  tickerValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  tickerLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tickerSub: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  tickerTrend: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  tickerSubText: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 6,
  },

  // Alert badge
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.redSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBadgeText: {
    color: Colors.red,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  // Grid label
  gridLabel: {
    backgroundColor: Colors.panelHi,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridLabelText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
});
