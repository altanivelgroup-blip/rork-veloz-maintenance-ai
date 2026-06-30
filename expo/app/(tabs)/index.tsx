import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Activity, AlertTriangle, ArrowRight, Calendar, CheckCircle, ChevronRight, Clock, Container, DollarSign, Fuel, Route, ShieldCheck, Truck, Wrench, Zap } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import InsightCard from "@/components/InsightCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import Sparkline from "@/components/Sparkline";
import StatusBadge from "@/components/StatusBadge";
import { Colors, Gradients } from "@/constants/colors";
import { availabilityMeta } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";

export default function DashboardScreen() {
  const { fleetHealth, counts, trucks, trailers, allInsights, ai, inspections, availabilityCounts, expiredInspections } = useFleet();

  const topInsights = allInsights.slice(0, 3);
  const upcomingInspections = useMemo(() => {
    return inspections.filter((i) => i.result !== "pass").slice(0, 3);
  }, [inspections]);

  const outOfService = useMemo(() => {
    return [
      ...trucks.filter((t) => t.status === "out").map((t) => ({ id: t.id, kind: "truck" as const, name: t.nickname, sub: `${t.year} ${t.make} ${t.model}` })),
      ...trailers.filter((t) => t.status === "out").map((t) => ({ id: t.id, kind: "trailer" as const, name: t.nickname, sub: `${t.year} ${t.make} ${t.model}` })),
    ];
  }, [trucks, trailers]);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>VELOZ • COMMAND CENTER</Text>
          <Text style={styles.h1}>Fleet Operations</Text>
          <Text style={styles.sub}>Live snapshot · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</Text>
        </View>
        <View style={styles.liveDot}>
          <View style={styles.liveDotInner} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Hero — Fleet Health */}
      <Card gradient={Gradients.cardHi} glow style={styles.hero}>
        <View style={styles.heroRow}>
          <HealthGauge value={fleetHealth} size={130} label="Fleet Health" />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.heroLabel}>OPERATIONAL READINESS</Text>
            <Text style={styles.heroValue}>{ai.readiness}%</Text>
            <View style={styles.statusRow}>
              <StatusBadge status="operational" />
              <Text style={styles.statusText}>{counts.operational} ready</Text>
            </View>
            <View style={styles.statusRow}>
              <StatusBadge status="attention" />
              <Text style={styles.statusText}>{counts.attention} attention</Text>
            </View>
            <View style={styles.statusRow}>
              <StatusBadge status="out" />
              <Text style={styles.statusText}>{counts.out} out</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Quick stats */}
      <View style={styles.statGrid}>
        <StatTile icon={<Truck color={Colors.cyan} size={18} />} label="Trucks" value={`${counts.trucksOp}/${trucks.length}`} caption="operational" />
        <StatTile icon={<Container color={Colors.cyan} size={18} />} label="Trailers" value={`${counts.trailersOp}/${trailers.length}`} caption="operational" />
        <StatTile icon={<AlertTriangle color={Colors.amber} size={18} />} label="Alerts" value={`${allInsights.filter((i) => i.severity !== "info").length}`} caption="active" />
        <StatTile icon={<Wrench color={Colors.red} size={18} />} label="Overdue" value={`${ai.predictions.filter((p) => p.eta === "Now").length}`} caption="services" />
      </View>

      {/* Availability Matrix */}
      <SectionHeader kicker="Dispatch" title="Availability Matrix" />
      <Card>
        <View style={styles.availGrid}>
          <AvailTile icon={<CheckCircle color={availabilityMeta.available.color} size={18} />} label="Available" value={`${availabilityCounts.available}`} color={availabilityMeta.available.color} />
          <AvailTile icon={<Route color={availabilityMeta.assigned.color} size={18} />} label="In-Transit" value={`${availabilityCounts.assigned}`} color={availabilityMeta.assigned.color} />
          <AvailTile icon={<Wrench color={availabilityMeta.in_shop.color} size={18} />} label="In Shop" value={`${availabilityCounts.inShop}`} color={availabilityMeta.in_shop.color} />
          <AvailTile icon={<Clock color={availabilityMeta.staged.color} size={18} />} label="Staged" value={`${availabilityCounts.staged}`} color={availabilityMeta.staged.color} />
        </View>
        <View style={styles.availBar}>
          {availabilityCounts.available > 0 && <View style={[styles.availBarSeg, { flex: availabilityCounts.available, backgroundColor: availabilityMeta.available.color }]} />}
          {availabilityCounts.assigned > 0 && <View style={[styles.availBarSeg, { flex: availabilityCounts.assigned, backgroundColor: availabilityMeta.assigned.color }]} />}
          {availabilityCounts.inShop > 0 && <View style={[styles.availBarSeg, { flex: availabilityCounts.inShop, backgroundColor: availabilityMeta.in_shop.color }]} />}
          {availabilityCounts.staged > 0 && <View style={[styles.availBarSeg, { flex: availabilityCounts.staged, backgroundColor: availabilityMeta.staged.color }]} />}
        </View>
      </Card>

      {/* Inspection Expired Alerts */}
      {expiredInspections.length > 0 && (
        <>
          <SectionHeader kicker="Compliance" title={`Inspection Expired (${expiredInspections.length})`} />
          <View style={{ gap: 10 }}>
            {expiredInspections.map((eq) => (
              <Pressable key={`${eq.kind}-${eq.id}`} onPress={() => router.push(`/${eq.kind}/${eq.id}` as never)}>
                <View style={styles.expiredCard}>
                  <LinearGradient colors={["rgba(255,84,112,0.2)", "rgba(255,84,112,0.04)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                  <View style={[styles.iconBubble, { backgroundColor: "rgba(255,84,112,0.18)" }]}>
                    <AlertTriangle color="#FF5470" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.oosName}>{eq.name}</Text>
                    <Text style={styles.oosSub}>Pre-trip expired · {Math.floor(eq.hoursAgo)}h since last</Text>
                  </View>
                  <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 8 }} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Fuel + Cost */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <View style={styles.trendHead}>
            <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.15)" }]}>
              <Fuel color={Colors.cyan} size={16} />
            </View>
            <Text style={styles.trendLabel}>FUEL TREND</Text>
          </View>
          <Text style={styles.trendValue}>{ai.mpgTrend[ai.mpgTrend.length - 1].toFixed(1)}<Text style={styles.trendUnit}> MPG</Text></Text>
          <Sparkline data={ai.mpgTrend} width={150} height={50} color={Colors.cyan} />
          <Text style={styles.trendDelta}>12-week avg</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={styles.trendHead}>
            <View style={[styles.iconBubble, { backgroundColor: "rgba(61,139,255,0.18)" }]}>
              <DollarSign color={Colors.blue} size={16} />
            </View>
            <Text style={styles.trendLabel}>MAINT. COST</Text>
          </View>
          <Text style={styles.trendValue}>$<Text>{(ai.costTrend[ai.costTrend.length - 1] / 1000).toFixed(2)}k</Text></Text>
          <Sparkline data={ai.costTrend} width={150} height={50} color={Colors.blue} />
          <Text style={styles.trendDelta}>this week</Text>
        </Card>
      </View>

      {/* AI Insights */}
      <SectionHeader
        kicker="AI Intelligence"
        title="Operational Insights"
        right={
          <Pressable onPress={() => router.push("/(tabs)/ai")} style={styles.allBtn}>
            <Text style={styles.allBtnText}>All</Text>
            <ChevronRight color={Colors.cyan} size={14} />
          </Pressable>
        }
      />
      <View style={{ gap: 10 }}>
        {topInsights.map((i) => (
          <InsightCard key={i.id} severity={i.severity} title={i.title} detail={i.detail} equipment={i.equipment} />
        ))}
      </View>

      {/* Out of Service */}
      {outOfService.length > 0 && (
        <>
          <SectionHeader kicker="Critical" title="Out of Service" />
          <View style={{ gap: 10 }}>
            {outOfService.map((eq) => (
              <Pressable
                key={`${eq.kind}-${eq.id}`}
                onPress={() => router.push(`/${eq.kind}/${eq.id}` as never)}
              >
                <View style={styles.oosCard}>
                  <LinearGradient colors={["rgba(255,84,112,0.25)", "rgba(255,84,112,0.05)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                  <View style={[styles.iconBubble, { backgroundColor: "rgba(255,84,112,0.22)" }]}>
                    {eq.kind === "truck" ? <Truck color={Colors.red} size={18} /> : <Container color={Colors.red} size={18} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.oosName}>{eq.name}</Text>
                    <Text style={styles.oosSub}>{eq.sub}</Text>
                  </View>
                  <StatusBadge status="out" />
                  <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 8 }} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Upcoming inspections / flagged */}
      <SectionHeader
        kicker="Workflow"
        title="Inspections Needing Attention"
        right={
          <Pressable onPress={() => router.push("/(tabs)/inspections")} style={styles.allBtn}>
            <Text style={styles.allBtnText}>All</Text>
            <ChevronRight color={Colors.cyan} size={14} />
          </Pressable>
        }
      />
      <View style={{ gap: 10 }}>
        {upcomingInspections.length === 0 ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ShieldCheck color={Colors.green} size={22} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>All clear</Text>
                <Text style={styles.sub2}>No flagged inspections in last 30 days.</Text>
              </View>
            </View>
          </Card>
        ) : (
          upcomingInspections.map((i) => {
            const eq = i.equipmentKind === "truck"
              ? trucks.find((t) => t.id === i.equipmentId)
              : trailers.find((t) => t.id === i.equipmentId);
            const fail = i.result === "fail";
            return (
              <Card key={i.id} onPress={() => router.push(`/inspection/${i.id}`)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.iconBubble, { backgroundColor: fail ? "rgba(255,84,112,0.18)" : "rgba(255,181,71,0.18)" }]}>
                    <Calendar color={fail ? Colors.red : Colors.amber} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{eq?.nickname} · {i.type === "pre-trip" ? "Pre-trip" : "Post-trip"}</Text>
                    <Text style={styles.sub2}>{i.date} · {i.driver}</Text>
                  </View>
                  <StatusBadge status={fail ? "out" : "attention"} />
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Quick actions */}
      <SectionHeader kicker="Quick Action" title="Run an Inspection" />
      <Pressable onPress={() => router.push("/inspection/new")}>
        <View style={styles.ctaWrap}>
          <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={[styles.iconBubble, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <Zap color="#fff" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Start Pre-Trip Inspection</Text>
            <Text style={styles.ctaSub}>Get road ready in under 60 seconds</Text>
          </View>
          <ArrowRight color="#fff" size={20} />
        </View>
      </Pressable>

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Activity color={Colors.cyan} size={20} />
          <Text style={[styles.sub2, { flex: 1 }]}>Uptime <Text style={styles.title}>98.6%</Text> · Cost / mile <Text style={styles.title}>$0.41</Text></Text>
        </View>
      </Card>
    </Screen>
  );
}

function StatTile({ icon, label, value, caption }: { icon: React.ReactNode; label: string; value: string; caption: string }) {
  return (
    <View style={styles.statTile}>
      <LinearGradient colors={["#13294C", "#0E1E3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.statTileBorder} pointerEvents="none" />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statCaption}>{caption}</Text>
    </View>
  );
}

function AvailTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <View style={[styles.availTile, { borderColor: `${color}30` }]}>
      {icon}
      <Text style={[styles.availValue, { color }]}>{value}</Text>
      <Text style={[styles.availLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, marginTop: 4 },
  kicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 2.4, fontWeight: "800", textTransform: "uppercase" },
  h1: { color: Colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.6, marginTop: 4 },
  sub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  liveDot: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: "rgba(34,211,153,0.12)", borderWidth: 1, borderColor: "rgba(34,211,153,0.35)",
  },
  liveDotInner: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.green },
  liveText: { color: Colors.green, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  hero: { paddingVertical: 4 },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroLabel: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.8, fontWeight: "800", textTransform: "uppercase" },
  heroValue: { color: Colors.text, fontSize: 38, fontWeight: "800", letterSpacing: -1, marginBottom: 8, marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  statusText: { color: Colors.textMuted, fontSize: 12, fontWeight: "600" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: {
    flexBasis: "47.5%", flexGrow: 1, borderRadius: 16, padding: 14, overflow: "hidden", position: "relative",
  },
  statTileBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase" },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  statCaption: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  trendHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trendLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  trendValue: { color: Colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  trendUnit: { fontSize: 13, color: Colors.textMuted, fontWeight: "700" },
  trendDelta: { color: Colors.textDim, fontSize: 11, marginTop: 4 },
  allBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  allBtnText: { color: Colors.cyan, fontSize: 13, fontWeight: "700" },
  oosCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,84,112,0.35)",
  },
  oosName: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  oosSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  title: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  sub2: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  ctaWrap: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 18, borderRadius: 20, overflow: "hidden",
    shadowColor: "#1E5BFF", shadowOpacity: 0.45, shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, elevation: 8,
  },
  ctaTitle: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  ctaSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  availGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  availTile: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1 },
  availValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, marginTop: 6 },
  availLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 },
  availBar: { flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 },
  availBarSeg: { height: "100%", borderRadius: 2 },
  expiredCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,84,112,0.3)",
  },
});
