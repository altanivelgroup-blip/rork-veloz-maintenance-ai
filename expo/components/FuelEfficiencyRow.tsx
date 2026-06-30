import { LinearGradient } from "expo-linear-gradient";
import { ArrowDown, ArrowUp, Flame, Gauge, Minus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  truckName: string;
  make: string;
  model: string;
  currentMpg: number;
  mpgTrend: "up" | "down" | "stable";
  baselineMpg: number;
  degraded: boolean;
  degradationAlert: string | null;
  rank: number;
};

export default function FuelEfficiencyRow({
  truckName,
  make,
  model,
  currentMpg,
  mpgTrend,
  baselineMpg,
  degraded,
  degradationAlert,
  rank,
}: Props) {
  const dropPct = baselineMpg > 0 ? Math.round(((baselineMpg - currentMpg) / baselineMpg) * 100) : 0;
  const aboveBaseline = currentMpg > baselineMpg;

  return (
    <View style={styles.wrap}>
      {/* Rank badge */}
      <View style={[styles.rankBadge, rank === 1 && styles.rankGold]}>
        <Text style={[styles.rankText, rank === 1 && styles.rankTextGold]}>
          #{rank}
        </Text>
      </View>

      {/* Truck info */}
      <View style={styles.info}>
        <Text style={styles.name}>{truckName}</Text>
        <Text style={styles.sub}>
          {make} {model}
        </Text>
        {degraded && degradationAlert && (
          <View style={styles.degradedTag}>
            <Flame size={10} color={Colors.red} />
            <Text style={styles.degradedText} numberOfLines={1}>
              {degraded ? `MPG degraded ${dropPct}%` : ""}
            </Text>
          </View>
        )}
      </View>

      {/* MPG gauge */}
      <View style={styles.mpgCol}>
        <View style={styles.mpgRow}>
          <Gauge size={14} color={degraded ? Colors.amber : Colors.cyan} style={{ marginRight: 4 }} />
          <Text style={[styles.mpgValue, degraded && styles.mpgDegraded]}>
            {currentMpg.toFixed(1)}
          </Text>
        </View>
        <Text style={styles.mpgLabel}>MPG</Text>

        {/* Trend indicator */}
        <View style={styles.trendRow}>
          {mpgTrend === "up" ? (
            <ArrowUp size={10} color={Colors.green} />
          ) : mpgTrend === "down" ? (
            <ArrowDown size={10} color={Colors.amber} />
          ) : (
            <Minus size={10} color={Colors.textDim} />
          )}
          <Text style={[styles.trendText, { color: mpgTrend === "up" ? Colors.green : mpgTrend === "down" ? Colors.amber : Colors.textDim }]}>
            {mpgTrend === "up" ? "Rising" : mpgTrend === "down" ? "Falling" : "Stable"}
          </Text>
        </View>
      </View>

      {/* Baseline comparison */}
      <View style={styles.baselineCol}>
        <Text style={styles.baselineLabel}>Baseline</Text>
        <Text style={styles.baselineValue}>{baselineMpg.toFixed(1)}</Text>
        <Text
          style={[
            styles.vs,
            { color: aboveBaseline ? Colors.green : degraded ? Colors.red : Colors.textDim },
          ]}
        >
          {aboveBaseline ? `+${dropPct * -1}%` : `${dropPct > 0 ? `-${dropPct}%` : "—"}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,40,71,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.panelHi,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankGold: {
    backgroundColor: "rgba(212,175,55,0.2)",
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  rankText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  rankTextGold: {
    color: Colors.gold,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sub: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  degradedTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: Colors.redSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  degradedText: {
    color: Colors.red,
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 4,
    maxWidth: 120,
  },
  mpgCol: {
    alignItems: "center",
    marginRight: 12,
    minWidth: 72,
  },
  mpgRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mpgValue: {
    color: Colors.cyan,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  mpgDegraded: {
    color: Colors.amber,
  },
  mpgLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    marginTop: -2,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 3,
  },
  baselineCol: {
    alignItems: "center",
    minWidth: 48,
  },
  baselineLabel: {
    color: Colors.textDim,
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  baselineValue: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  vs: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
});
