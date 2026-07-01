import { router } from "expo-router";
import { ChevronRight, Fuel, Gauge, MapPin, PackageCheck, ShieldCheck, Wrench } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import Card from "@/components/Card";
import RoadReadyBadge from "@/components/RoadReadyBadge";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import StatusBadge from "@/components/StatusBadge";
import TruckSilhouette from "@/components/TruckSilhouette";
import { Colors, statusMeta } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";
import { formatMiles } from "@/utils/format";

export default function TrucksScreen() {
  const { trucks, getCurrentOperator, getTrailer, activeSessions } = useFleet();

  return (
    <Screen>
      <SectionHeader kicker="Truck Operations" title="Fleet Trucks" />
      <Text style={styles.sub}>{trucks.length} of 5 trucks · Phase 1 capacity</Text>

      <View style={{ gap: 12 }}>
        {trucks.map((truck) => {
          const tint = statusMeta[truck.status].color;
          const operator = getCurrentOperator(truck.id);
          const trailer = truck.assignedTrailerId ? getTrailer(truck.assignedTrailerId) : undefined;
          const session = activeSessions.find((item) => item.truckId === truck.id);
          const cargoCount = session?.cargoManifest.length ?? 0;
          const inspectionLabel = truck.lastInspectionResult === "pass" ? "Passed" : truck.lastInspectionResult === "fail" ? "Failed" : truck.lastInspectionResult === "flagged" ? "Flagged" : "Required";
          const gpsLabel = truck.status === "out" ? "Offline" : "Online";

          return (
            <Pressable key={truck.id} onPress={() => router.push(`/truck/${truck.id}`)}>
              <Card glow={truck.status === "out"}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>UNIT {truck.nickname.toUpperCase()} · {truck.cdl}</Text>
                    <Text style={styles.name}>{truck.year} {truck.make} {truck.model}</Text>
                    <Text style={styles.sub}>{truck.trim} · {truck.fuelType}</Text>
                  </View>
                  <RoadReadyBadge status={truck.roadReadyStatus} />
                </View>

                <View style={styles.assetRow}>
                  <View style={styles.silhouetteWrap}>
                    <TruckSilhouette subtype={truck.subtype} tint={tint} width={156} height={82} />
                  </View>
                  <View style={styles.priorityStack}>
                    <PriorityLine label="Driver" value={operator?.name ?? "Unmanned — Staged"} />
                    <PriorityLine label="Trailer" value={trailer?.nickname ?? "None / Bobtail"} />
                    <PriorityLine label="Current load" value={cargoCount > 0 ? `${cargoCount} vehicle${cargoCount > 1 ? "s" : ""}` : "No active load"} />
                    <PriorityLine label="GPS" value={gpsLabel} tone={gpsLabel === "Offline" ? "red" : "green"} />
                  </View>
                </View>

                <View style={styles.statusGrid}>
                  <StatusItem icon={<Wrench color={Colors.electric} size={13} />} label="Maintenance" content={<StatusBadge status={truck.status} />} />
                  <StatusItem icon={<ShieldCheck color={Colors.electric} size={13} />} label="Inspection" value={inspectionLabel} />
                  <StatusItem icon={<PackageCheck color={Colors.electric} size={13} />} label="Availability" content={<AvailabilityBadge state={truck.availability} />} />
                  <StatusItem icon={<Gauge color={Colors.electric} size={13} />} label="Odometer" value={formatMiles(truck.mileage)} />
                  <StatusItem icon={<Fuel color={Colors.electric} size={13} />} label="MPG" value={truck.avgMpg.toFixed(1)} />
                  <StatusItem icon={<MapPin color={Colors.electric} size={13} />} label="Telematics" value={gpsLabel} />
                </View>

                <View style={styles.footer}>
                  <Text style={styles.viewProfile}>View truck profile</Text>
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
