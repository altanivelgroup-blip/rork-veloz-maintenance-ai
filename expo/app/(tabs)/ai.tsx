import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Activity, AlertTriangle, ChevronRight, Cpu, Fuel, Gauge, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import InsightCard from "@/components/InsightCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import Sparkline from "@/components/Sparkline";
import { Colors, Gradients } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

export default function FleetAIScreen() {
  const { ai, fleetHealth, allInsights, trucks, trailers } = useFleet();
  const fuelDelta = ((ai.mpgTrend[ai.mpgTrend.length - 1] - ai.mpgTrend[0]) / ai.mpgTrend[0]) * 100;
  const fuelUp = fuelDelta >= 0;

  const riskColor = ai.downtimeRisk === "Low" ? Colors.green : ai.downtimeRisk === "Medium" ? Colors.amber : Colors.red;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>FLEET AI · INTELLIGENCE</Text>
          <Text style={styles.h1}>Operational Brain</Text>
          <Text style={styles.sub}>AI-driven readiness, predictions & analysis</Text>
        </View>
        <View style={styles.aiBadge}>
          <Sparkles color={Colors.cyan} size={14} />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      {/* Hero readiness */}
      <Card gradient={Gradients.cardHi} glow>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <HealthGauge value={ai.readiness} size={140} label="Readiness" />
          <View style={{ flex: 1, marginLeft: 16, gap: 10 }}>
            <Text style={styles.heroLabel}>FLEET HEALTH</Text>
            <Text style={styles.heroValue}>{fleetHealth}%</Text>
            <View style={[styles.riskPill, { backgroundColor: riskColor + "22", borderColor: riskColor + "55" }]}>
              <Activity color={riskColor} size={13} />
              <Text style={[styles.riskText, { color: riskColor }]}>{ai.downtimeRisk} downtime risk</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Trend duo */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <View style={styles.trendHead}>
            <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.15)" }]}>
              <Fuel color={Colors.cyan} size={16} />
            </View>
            <Text style={styles.trendLabel}>MPG TREND</Text>
          </View>
          <Text style={styles.trendValue}>{ai.mpgTrend[ai.mpgTrend.length - 1].toFixed(1)}</Text>
          <View style={styles.deltaRow}>
            {fuelUp ? <TrendingUp color={Colors.green} size={12} /> : <TrendingDown color={Colors.red} size={12} />}
            <Text style={[styles.delta, { color: fuelUp ? Colors.green : Colors.red }]}>{fuelDelta.toFixed(1)}% · 12wk</Text>
          </View>
          <Sparkline data={ai.mpgTrend} width={150} height={50} color={Colors.cyan} />
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={styles.trendHead}>
            <View style={[styles.iconBubble, { backgroundColor: "rgba(61,139,255,0.18)" }]}>
              <Gauge color={Colors.blue} size={16} />
            </View>
            <Text style={styles.trendLabel}>COST / WEEK</Text>
          </View>
          <Text style={styles.trendValue}>${(ai.costTrend[ai.costTrend.length - 1] / 1000).toFixed(1)}k</Text>
          <Text style={styles.trendDelta}>12-wk avg ${(ai.costTrend.reduce((a, b) => a + b, 0) / ai.costTrend.length / 1000).toFixed(1)}k</Text>
          <Sparkline data={ai.costTrend} width={150} height={50} color={Colors.blue} />
        </Card>
      </View>

      {/* Predictions */}
      <SectionHeader kicker="Predictive" title="AI Service Predictions" />
      <View style={{ gap: 10 }}>
        {ai.predictions.map((p) => {
          const c = p.severity === "fail" ? Colors.red : Colors.amber;
          return (
            <View key={p.id} style={styles.predRow}>
              <View style={[styles.predIcon, { backgroundColor: c + "22", borderColor: c + "55" }]}>
                <AlertTriangle color={c} size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.predTitle}>{p.title}</Text>
                <Text style={styles.predEta}>{p.eta}</Text>
              </View>
              <View style={[styles.predTag, { borderColor: c + "55", backgroundColor: c + "10" }]}>
                <Text style={[styles.predTagText, { color: c }]}>{p.severity === "fail" ? "CRITICAL" : "WATCH"}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* High-risk equipment */}
      <SectionHeader kicker="Equipment" title="High-Risk Assets" />
      <View style={{ gap: 10 }}>
        {[...trucks, ...trailers]
          .filter((eq) => eq.health < 75)
          .sort((a, b) => a.health - b.health)
          .map((eq) => {
            const isTruck = "fuelType" in eq;
            return (
              <Pressable
                key={eq.id}
                onPress={() => router.push(`/${isTruck ? "truck" : "trailer"}/${eq.id}` as never)}
              >
                <View style={styles.riskCard}>
                  <LinearGradient
                    colors={eq.health < 50 ? ["rgba(255,84,112,0.22)", "rgba(255,84,112,0.04)"] : ["rgba(255,181,71,0.18)", "rgba(255,181,71,0.04)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <HealthGauge value={eq.health} size={54} thickness={5} label="" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.riskTitle}>{eq.nickname}</Text>
                    <Text style={styles.riskSub}>{eq.year} {eq.make} {eq.model}</Text>
                  </View>
                  <ChevronRight color={Colors.textMuted} size={18} />
                </View>
              </Pressable>
            );
          })}
      </View>

      {/* All insights */}
      <SectionHeader kicker="Stream" title="Live AI Insights" />
      <View style={{ gap: 10 }}>
        {allInsights.slice(0, 8).map((i) => (
          <InsightCard key={i.id} severity={i.severity} title={i.title} detail={i.detail} equipment={i.equipment} />
        ))}
      </View>

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Cpu color={Colors.cyan} size={20} />
          <Text style={[styles.sub, { flex: 1 }]}>
            Predictions are demo intelligence. Real-time OBD-II diagnostics and predictive ML models will plug into this stream in Phase 2.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, marginTop: 4 },
  kicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 2.4, fontWeight: "800", textTransform: "uppercase" },
  h1: { color: Colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.6, marginTop: 4 },
  sub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(94,231,255,0.12)", borderWidth: 1, borderColor: "rgba(94,231,255,0.4)" },
  aiBadgeText: { color: Colors.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heroLabel: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.8, fontWeight: "800", textTransform: "uppercase" },
  heroValue: { color: Colors.text, fontSize: 36, fontWeight: "800", letterSpacing: -1 },
  riskPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  riskText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trendHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  trendLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  trendValue: { color: Colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  trendDelta: { color: Colors.textDim, fontSize: 11, marginTop: 4 },
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  delta: { fontSize: 11, fontWeight: "800" },
  predRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  predIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  predTitle: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  predEta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  predTag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  predTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  riskCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  riskTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  riskSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});
