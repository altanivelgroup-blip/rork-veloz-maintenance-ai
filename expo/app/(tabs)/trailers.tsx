import { router } from "expo-router";
import { ChevronRight, Layers, Link2, MapPin, PackageCheck, Ruler, ShieldCheck, Weight, Wrench } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import Card from "@/components/Card";
import RoadReadyBadge from "@/components/RoadReadyBadge";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import StatusBadge from "@/components/StatusBadge";
import TrailerSilhouette from "@/components/TrailerSilhouette";
import { Colors, statusMeta } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";
import { formatWeightCompact } from "@/utils/format";

export default function TrailersScreen() {
  const { trailers, getTruck, getCurrentOperator, activeSessions } = useFleet();

  return (
    <Screen>
      <SectionHeader kicker="Trailer Operations" title="Fleet Trailers" />
      <Text style={styles.sub}>{trailers.length} of 5 trailers · Phase 1 capacity</Text>

      <View style={{ gap: 12 }}>
        {trailers.map((trailer) => {
          const tint = statusMeta[trailer.status].color;
          const truck = trailer.assignedTruckId ? getTruck(trailer.assignedTruckId) : undefined;
          const operator = getCurrentOperator(trailer.id);
          const session = activeSessions.find((item) => item.trailerId === trailer.id);
          const cargoCount = session?.cargoManifest.length ?? 0;
          const inspectionLabel = trailer.lastInspectionResult === "pass" ? "Passed" : trailer.lastInspectionResult === "fail" ? "Failed" : trailer.lastInspectionResult === "flagged" ? "Flagged" : "Required";
          const gpsLabel = trailer.status === "out" ? "Offline" : "Online";

          return (
            <Pressable key={trailer.id} onPress={() => router.push(`/trailer/${trailer.id}`)}>
              <Card glow={trailer.status === "out"}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>TRAILER {trailer.nickname.toUpperCase()} · {trailer.enclosed ? "ENCLOSED" : "OPEN"}</Text>
                    <Text style={styles.name}>{trailer.type}</Text>
                    <Text style={styles.sub}>{trailer.year} {trailer.make} {trailer.model}</Text>
                  </View>
                  <RoadReadyBadge status={trailer.roadReadyStatus} />
                </View>

                <View style={styles.assetRow}>
                  <View style={styles.silhouetteWrap}>
                    <TrailerSilhouette subtype={trailer.subtype} tint={tint} enclosed={trailer.enclosed} width={156} height={78} />
                  </View>
                  <View style={styles.priorityStack}>
                    <PriorityLine label="Truck" value={truck?.nickname ?? "Unassigned"} />
                    <PriorityLine label="Driver" value={operator?.name ?? "No active operator"} />
                    <PriorityLine label="Current load" value={cargoCount > 0 ? `${cargoCount} vehicle${cargoCount > 1 ? "s" : ""}` : "No active load"} />
                    <PriorityLine label="GPS" value={gpsLabel} tone={gpsLabel === "Offline" ? "red" : "green"} />
                  </View>
                </View>

                <View style={styles.statusGrid}>
                  <StatusItem icon={<Ruler color={Colors.electric} size={13} />} label="Capacity" value={`${trailer.carCapacity} car${trailer.carCapacity > 1 ? "s" : ""}`} />
                  <StatusItem icon={<Weight color={Colors.electric} size={13} />} label="GVWR" value={formatWeightCompact(trailer.gvwr)} />
                  <StatusItem icon={<Wrench color={Colors.electric} size={13} />} label="Maintenance" content={<StatusBadge status={trailer.status} />} />
                  <StatusItem icon={<ShieldCheck color={Colors.electric} size={13} />} label="Inspection" value={inspectionLabel} />
                  <StatusItem icon={<PackageCheck color={Colors.electric} size={13} />} label="Availability" content={<AvailabilityBadge state={trailer.availability} />} />
                  <StatusItem icon={<Layers color={Colors.electric} size={13} />} label="Axles" value={`${trailer.axles}`} />
                  <StatusItem icon={<Link2 color={Colors.electric} size={13} />} label="Truck" value={truck?.nickname ?? "None"} />
                  <StatusItem icon={<MapPin color={Colors.electric} size={13} />} label="Telematics" value={gpsLabel} />
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

function PriorityLine({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) {
  const color = tone === "green" ? Colors.green : tone === "red" ? Colors.red : Colors.text;
  return (
    <View style={styles.priorityLine}>
      <Text style={styles.priorityLabel}>{label}</Text>
      <Text style={[styles.priorityValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function StatusItem({ icon, label, value, content }: { icon: React.ReactNode; label: string; value?: string; content?: React.ReactNode }) {
  return (
    <View style={styles.statusItem}>
      <View style={styles.statusHeader}>{icon}<Text style={styles.statusLabel}>{label}</Text></View>
      {content ?? <Text style={styles.statusValue} numberOfLines={1}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  eyebrow: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase" },
  name: { color: Colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  silhouetteWrap: { width: 164, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.025)", borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  priorityStack: { flex: 1, gap: 6 },
  priorityLine: { gap: 1 },
  priorityLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  priorityValue: { color: Colors.text, fontSize: 12, fontWeight: "800" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  statusItem: { width: "31.5%", minWidth: 96, gap: 5, paddingHorizontal: 9, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.035)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  statusValue: { color: Colors.text, fontSize: 11, fontWeight: "800" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 10, gap: 4 },
  viewProfile: { color: Colors.cyan, fontSize: 12, fontWeight: "700" },
});
