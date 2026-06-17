import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Camera, Check, ChevronRight, ClipboardCheck, Container, Plus, Truck, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

type Filter = "all" | "pass" | "flagged" | "fail";

export default function InspectionsScreen() {
  const { inspections, trucks, trailers } = useFleet();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return inspections;
    return inspections.filter((i) => i.result === filter);
  }, [inspections, filter]);

  function nameFor(kind: "truck" | "trailer", id: string) {
    if (kind === "truck") return trucks.find((t) => t.id === id)?.nickname ?? "Truck";
    return trailers.find((t) => t.id === id)?.nickname ?? "Trailer";
  }

  return (
    <Screen>
      <SectionHeader kicker="Inspection Center" title="Pre & Post Trip" />

      {/* CTA */}
      <Pressable onPress={() => router.push("/inspection/new")}>
        <View style={styles.cta}>
          <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.ctaIcon}>
            <Plus color="#fff" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>New Inspection</Text>
            <Text style={styles.ctaSub}>Start a pre-trip or post-trip workflow</Text>
          </View>
          <ChevronRight color="#fff" size={20} />
        </View>
      </Pressable>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(["all", "pass", "flagged", "fail"] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)}>
            <View style={[styles.chip, filter === f && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.toUpperCase()}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionHeader kicker="History" title="Inspection Timeline" />

      <View style={styles.timeline}>
        {filtered.map((i, idx) => {
          const accent =
            i.result === "pass" ? Colors.green : i.result === "fail" ? Colors.red : Colors.amber;
          const Icon = i.equipmentKind === "truck" ? Truck : Container;
          const okCount = i.items.filter((it) => it.ok).length;
          return (
            <View key={i.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: accent, shadowColor: accent }]} />
                {idx < filtered.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <Pressable style={{ flex: 1 }} onPress={() => router.push(`/inspection/${i.id}`)}>
                <Card>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={[styles.eqIcon, { backgroundColor: accent + "22" }]}>
                      <Icon color={accent} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eq}>{nameFor(i.equipmentKind, i.equipmentId)} · {i.type === "pre-trip" ? "Pre-trip" : "Post-trip"}</Text>
                      <Text style={styles.meta}>{i.date} · {i.driver}{i.mileage ? ` · ${i.mileage.toLocaleString()} mi` : ""}</Text>
                    </View>
                    <View style={[styles.resultBadge, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
                      {i.result === "pass" ? <Check color={accent} size={12} /> : <X color={accent} size={12} />}
                      <Text style={[styles.resultText, { color: accent }]}>{i.result.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.metricsRow}>
                    <View style={styles.miniStat}>
                      <ClipboardCheck color={Colors.electric} size={12} />
                      <Text style={styles.miniStatText}>{okCount}/{i.items.length} checks</Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Camera color={Colors.electric} size={12} />
                      <Text style={styles.miniStatText}>{i.photos} photos</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 18, borderRadius: 20, overflow: "hidden",
    shadowColor: "#1E5BFF", shadowOpacity: 0.45, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 8,
  },
  ctaIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  ctaTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ctaSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: "rgba(255,255,255,0.03)" },
  chipActive: { backgroundColor: "rgba(94,231,255,0.12)", borderColor: "rgba(94,231,255,0.45)" },
  chipText: { color: Colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  chipTextActive: { color: Colors.cyan },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineRail: { width: 14, alignItems: "center", paddingTop: 22 },
  timelineDot: { width: 12, height: 12, borderRadius: 99, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  timelineLine: { flex: 1, width: 2, backgroundColor: "rgba(120,180,255,0.18)", marginTop: 4 },
  eqIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eq: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  meta: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  resultBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  resultText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  metricsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  miniStatText: { color: Colors.textMuted, fontSize: 11, fontWeight: "700" },
});
