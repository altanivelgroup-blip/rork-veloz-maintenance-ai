import { LinearGradient } from "expo-linear-gradient";
import { TriangleAlert } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import IncidentCard from "@/components/IncidentCard";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients } from "@/constants/colors";
import { INCIDENTS, incidentStats, type IncidentStatus } from "@/constants/incidentData";

type Filter = "all" | IncidentStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_review", label: "In Review" },
  { key: "resolved", label: "Resolved" },
];

export default function IncidentsScreen() {
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => incidentStats(INCIDENTS), []);

  const filtered = useMemo(() => {
    const list = filter === "all" ? INCIDENTS : INCIDENTS.filter((i) => i.status === filter);
    const rank: Record<IncidentStatus, number> = { open: 0, in_review: 1, resolved: 2 };
    return [...list].sort((a, b) => {
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      return a.reportedAt < b.reportedAt ? 1 : -1;
    });
  }, [filter]);

  return (
    <Screen>
      <SectionHeader kicker="Incident Center" title="Fleet Incidents" />

      {/* Summary banner */}
      <View style={styles.banner}>
        <LinearGradient colors={Gradients.steel} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.bannerBorder} pointerEvents="none" />
        <View style={styles.bannerHead}>
          <View style={styles.bannerIcon}>
            <TriangleAlert color={Colors.cyan} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Operational Incidents</Text>
            <Text style={styles.bannerSub}>{stats.critical} critical · {stats.open + stats.inReview} active</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <Stat label="Open" value={stats.open} color={Colors.red} />
          <View style={styles.statDivider} />
          <Stat label="In Review" value={stats.inReview} color={Colors.amber} />
          <View style={styles.statDivider} />
          <Stat label="Resolved" value={stats.resolved} color={Colors.green} />
          <View style={styles.statDivider} />
          <Stat label="Total" value={stats.total} color={Colors.electric} />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f.key} onPress={() => setFilter(f.key)} style={{ flex: 1 }}>
            <View style={[styles.chip, filter === f.key && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <View style={styles.list}>
        {filtered.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <TriangleAlert color={Colors.textDim} size={28} />
            <Text style={styles.emptyText}>No incidents in this view</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 20, overflow: "hidden", padding: 16 },
  bannerBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderHi },
  bannerHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(94,231,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(94,231,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  bannerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  statRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  statLabel: { color: Colors.textMuted, fontSize: 10.5, fontWeight: "700", marginTop: 2, letterSpacing: 0.3 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  filterRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "rgba(94,231,255,0.12)", borderColor: "rgba(94,231,255,0.45)" },
  chipText: { color: Colors.textMuted, fontSize: 11.5, fontWeight: "800", letterSpacing: 0.3 },
  chipTextActive: { color: Colors.cyan },
  list: { gap: 12 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { color: Colors.textDim, fontSize: 13, fontWeight: "600" },
});
