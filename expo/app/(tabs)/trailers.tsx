import { router } from "expo-router";
import { ChevronRight, Layers, Ruler, Weight } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import StatusBadge from "@/components/StatusBadge";
import TrailerSilhouette from "@/components/TrailerSilhouette";
import { Colors, statusMeta } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

export default function TrailersScreen() {
  const { trailers } = useFleet();

  return (
    <Screen>
      <SectionHeader kicker="Trailer Operations" title="Fleet Trailers" />
      <Text style={styles.sub}>{trailers.length} of 5 trailers · Phase 1 capacity</Text>

      <View style={{ gap: 12 }}>
        {trailers.map((t) => {
          const tint = statusMeta[t.status].color;
          return (
            <Pressable key={t.id} onPress={() => router.push(`/trailer/${t.id}`)}>
              <Card glow={t.status === "out"}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>{t.type} · {t.enclosed ? "Enclosed" : "Open"}</Text>
                    <Text style={styles.name}>{t.nickname}</Text>
                    <Text style={styles.sub}>{t.year} {t.make} {t.model}</Text>
                  </View>
                  <HealthGauge value={t.health} size={66} thickness={6} label="" />
                </View>
                <View style={styles.silhouetteWrap}>
                  <TrailerSilhouette subtype={t.subtype} tint={tint} width={240} height={100} />
                </View>
                <View style={styles.statRow}>
                  <Stat icon={<Ruler color={Colors.electric} size={14} />} value={`${t.length}ft`} />
                  <Stat icon={<Weight color={Colors.electric} size={14} />} value={`${(t.gvwr / 1000).toFixed(0)}k GVWR`} />
                  <Stat icon={<Layers color={Colors.electric} size={14} />} value={`${t.axles}-axle`} />
                  <StatusBadge status={t.status} />
                </View>
                <View style={styles.footer}>
                  <Text style={styles.viewProfile}>View trailer profile</Text>
                  <ChevronRight color={Colors.cyan} size={16} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  eyebrow: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase" },
  name: { color: Colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  silhouetteWrap: { alignItems: "center", marginVertical: 4, opacity: 0.95 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  statText: { color: Colors.text, fontSize: 12, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 10, gap: 4 },
  viewProfile: { color: Colors.cyan, fontSize: 12, fontWeight: "700" },
});
