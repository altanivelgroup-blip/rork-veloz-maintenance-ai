import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Activity, Battery, Calendar, ChevronRight, CircleDot, ClipboardList, Cog, Disc, Droplet, FileText,
  Fuel, Gauge, IdCard, Link as LinkIcon, Plug, Settings2, ShieldCheck, Thermometer, Wind, Wrench, Zap,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import InsightCard from "@/components/InsightCard";
import MetricBar from "@/components/MetricBar";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import StatusBadge from "@/components/StatusBadge";
import TruckSilhouette from "@/components/TruckSilhouette";
import { Colors, statusMeta } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

export default function TruckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTruck, getTrailer } = useFleet();
  const truck = getTruck(id ?? "");
  if (!truck) return <Screen><Text style={{ color: Colors.text }}>Truck not found</Text></Screen>;

  const trailer = truck.assignedTrailerId ? getTrailer(truck.assignedTrailerId) : undefined;
  const tint = statusMeta[truck.status].color;

  return (
    <>
      <Stack.Screen options={{ title: truck.nickname }} />
      <Screen>
        {/* Hero */}
        <Card glow={truck.status !== "operational"}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{truck.cdl} · {truck.fuelType}</Text>
              <Text style={styles.h1}>{truck.nickname}</Text>
              <Text style={styles.sub}>{truck.year} {truck.make} {truck.model} {truck.trim}</Text>
              <View style={{ marginTop: 8 }}>
                <StatusBadge status={truck.status} />
              </View>
            </View>
            <HealthGauge value={truck.health} size={104} label="Health" />
          </View>
          <View style={styles.silhouetteWrap}>
            <TruckSilhouette tint={tint} width={300} height={130} />
          </View>
          <View style={styles.kvGrid}>
            <KV icon={<Gauge color={Colors.electric} size={14} />} label="Mileage" value={`${truck.mileage.toLocaleString()} mi`} />
            <KV icon={<Fuel color={Colors.electric} size={14} />} label="Avg MPG" value={`${truck.avgMpg.toFixed(1)}`} />
            <KV icon={<IdCard color={Colors.electric} size={14} />} label="Plate" value={`${truck.plate} · ${truck.state}`} />
            <KV icon={<FileText color={Colors.electric} size={14} />} label="VIN" value={truck.vin} />
          </View>
        </Card>

        {/* Assigned trailer */}
        {trailer && (
          <Pressable onPress={() => router.push(`/trailer/${trailer.id}`)}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.15)" }]}>
                  <LinkIcon color={Colors.cyan} size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignedKicker}>ASSIGNED TRAILER</Text>
                  <Text style={styles.title}>{trailer.nickname}</Text>
                  <Text style={styles.sub2}>{trailer.year} {trailer.make} {trailer.model}</Text>
                </View>
                <StatusBadge status={trailer.status} />
                <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 4 }} />
              </View>
            </Card>
          </Pressable>
        )}

        {/* AI Insights */}
        <SectionHeader kicker="AI · Truck Intelligence" title="Insights" />
        <View style={{ gap: 10 }}>
          {truck.insights.map((i) => (
            <InsightCard key={i.id} severity={i.severity} title={i.title} detail={i.detail} />
          ))}
        </View>

        {/* Modules */}
        <SectionHeader kicker="Maintenance" title="Engine" />
        <Card>
          <ModuleRow icon={<Droplet color={Colors.cyan} size={16} />} label="Oil service" value={truck.modules.engine.oilDueIn < 0 ? `Overdue ${Math.abs(truck.modules.engine.oilDueIn).toLocaleString()} mi` : `Due in ${truck.modules.engine.oilDueIn.toLocaleString()} mi`} status={truck.modules.engine.oilDueIn < 0 ? "out" : truck.modules.engine.oilDueIn < 2000 ? "attention" : "operational"} />
          <Divider />
          <ModuleRow icon={<Plug color={Colors.cyan} size={16} />} label="DEF level" value={`${truck.modules.engine.defLevel}%`} status={truck.modules.engine.defLevel < 15 ? "out" : truck.modules.engine.defLevel < 35 ? "attention" : "operational"} />
          <View style={{ marginTop: 8 }}>
            <MetricBar label="DEF tank" value={truck.modules.engine.defLevel} good={50} warn={20} />
          </View>
          <Divider />
          <ModuleRow icon={<Thermometer color={Colors.cyan} size={16} />} label="Coolant" value="Reservoir & temp" status={truck.modules.engine.coolant} />
          <Divider />
          <ModuleRow icon={<Wind color={Colors.cyan} size={16} />} label="Belts" value="Serpentine & accessory" status={truck.modules.engine.belts} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Transmission" />
        <Card>
          <ModuleRow icon={<Cog color={Colors.cyan} size={16} />} label="Fluid service" value={`Due in ${truck.modules.transmission.fluidDueIn.toLocaleString()} mi`} status={truck.modules.transmission.fluidDueIn < 5000 ? "attention" : "operational"} />
          <Divider />
          <ModuleRow icon={<Settings2 color={Colors.cyan} size={16} />} label="Service interval" value={`${truck.modules.transmission.serviceInterval.toLocaleString()} mi`} status="operational" />
        </Card>

        <SectionHeader kicker="Maintenance" title="Brakes" />
        <Card>
          <View style={{ gap: 14 }}>
            <MetricBar label="Pad life" value={truck.modules.brakes.padPct} />
            <MetricBar label="Rotor life" value={truck.modules.brakes.rotorPct} />
            <ModuleRow icon={<Droplet color={Colors.cyan} size={16} />} label="Brake fluid" value="Reservoir level" status={truck.modules.brakes.fluid} />
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Tires" />
        <Card>
          <View style={{ gap: 14 }}>
            <MetricBar label="Tread remaining" value={truck.modules.tires.wearPct} />
            <View style={styles.miniRow}>
              <MiniStat label="Age" value={`${truck.modules.tires.ageMonths} mo`} />
              <MiniStat label="Last rotation" value={`${truck.modules.tires.lastRotation.toLocaleString()} mi`} />
              <MiniStat label="Blowouts" value={`${truck.modules.tires.blowouts}`} />
            </View>
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Suspension" />
        <Card>
          <ModuleRow icon={<CircleDot color={Colors.cyan} size={16} />} label="Airbags" value="Pressure & condition" status={truck.modules.suspension.airbags} />
          <Divider />
          <ModuleRow icon={<Disc color={Colors.cyan} size={16} />} label="Shocks & springs" value="Damping & ride height" status={truck.modules.suspension.shocks} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Electrical" />
        <Card>
          <ModuleRow icon={<Battery color={Colors.cyan} size={16} />} label="Battery" value={`${truck.modules.electrical.batteryVolts.toFixed(1)} V resting`} status={truck.modules.electrical.batteryVolts < 12.2 ? "attention" : "operational"} />
          <Divider />
          <ModuleRow icon={<Zap color={Colors.cyan} size={16} />} label="Alternator" value="Charging output" status={truck.modules.electrical.alternator} />
          <Divider />
          <ModuleRow icon={<Plug color={Colors.cyan} size={16} />} label="Trailer wiring" value="7-pin harness" status={truck.modules.electrical.trailerWiring} />
        </Card>

        <SectionHeader kicker="Compliance" title="DOT & Documents" />
        <Card>
          <ModuleRow icon={<ShieldCheck color={Colors.cyan} size={16} />} label="DOT inspection" value={`Due ${truck.modules.compliance.dotDue}`} status="operational" />
          <Divider />
          <ModuleRow icon={<FileText color={Colors.cyan} size={16} />} label="Insurance" value={`Renews ${truck.modules.compliance.insuranceDue}`} status="operational" />
          <Divider />
          <ModuleRow icon={<Calendar color={Colors.cyan} size={16} />} label="Registration" value={`Renews ${truck.modules.compliance.registrationDue}`} status="operational" />
        </Card>

        {/* History */}
        <SectionHeader kicker="History" title="Service Timeline" />
        <Card>
          <View style={{ gap: 0 }}>
            {truck.history.map((h, idx) => (
              <View key={h.id}>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <View style={[styles.histDot, { backgroundColor: h.severity === "fail" ? Colors.red : h.severity === "warn" ? Colors.amber : Colors.cyan }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histType}>{h.type}</Text>
                    <Text style={styles.histMeta}>{h.date}{h.mileage ? ` · ${h.mileage.toLocaleString()} mi` : ""}{typeof h.cost === "number" ? ` · $${h.cost}` : ""}</Text>
                    {h.notes && <Text style={styles.histNote}>{h.notes}</Text>}
                  </View>
                </View>
                {idx < truck.history.length - 1 && <View style={styles.histLine} />}
              </View>
            ))}
          </View>
        </Card>

        {/* Documents */}
        <SectionHeader kicker="Vault" title="Equipment Documents" />
        <Card>
          {[
            { label: "Registration", expires: truck.modules.compliance.registrationDue, icon: <FileText color={Colors.cyan} size={16} /> },
            { label: "Insurance", expires: truck.modules.compliance.insuranceDue, icon: <ShieldCheck color={Colors.cyan} size={16} /> },
            { label: "DOT inspection", expires: truck.modules.compliance.dotDue, icon: <ClipboardList color={Colors.cyan} size={16} /> },
            { label: "Warranty", expires: "—", icon: <Wrench color={Colors.cyan} size={16} /> },
          ].map((d, i) => (
            <View key={d.label}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.12)" }]}>{d.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{d.label}</Text>
                  <Text style={styles.sub2}>Expires {d.expires}</Text>
                </View>
                <Pressable style={styles.uploadBtn}>
                  <Text style={styles.uploadText}>Upload</Text>
                </Pressable>
              </View>
              {i < 3 && <Divider />}
            </View>
          ))}
        </Card>

        {/* Cost analytics */}
        <SectionHeader kicker="Analytics" title="Cost & Utilization" />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>30-DAY MAINT.</Text>
            <Text style={styles.miniValue}>$1,240</Text>
            <Text style={styles.sub2}>Tires, oil, brakes</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>COST / MILE</Text>
            <Text style={styles.miniValue}>$0.42</Text>
            <Text style={styles.sub2}>Trailing 90 days</Text>
          </Card>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>UPTIME</Text>
            <Text style={styles.miniValue}>98.2%</Text>
            <Text style={styles.sub2}>Last 90 days</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>DOWNTIME COST</Text>
            <Text style={styles.miniValue}>$0</Text>
            <Text style={styles.sub2}>This month</Text>
          </Card>
        </View>

        <Pressable onPress={() => router.push("/inspection/new")}>
          <View style={styles.inspectCta}>
            <Activity color="#fff" size={18} />
            <Text style={styles.inspectCtaText}>Run inspection on {truck.nickname}</Text>
          </View>
        </Pressable>
      </Screen>
    </>
  );
}

function KV({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={styles.kvLabel}>{label}</Text>
      </View>
      <Text style={styles.kvValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ModuleRow({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status: keyof typeof statusMeta }) {
  return (
    <View style={styles.modRow}>
      <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.10)" }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modLabel}>{label}</Text>
        <Text style={styles.modValue}>{value}</Text>
      </View>
      <StatusBadge status={status} compact />
    </View>
  );
}

function Divider() { return <View style={styles.divider} />; }

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase" },
  h1: { color: Colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  sub2: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  title: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  silhouetteWrap: { alignItems: "center", marginTop: 6, marginBottom: 8 },
  kvGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  kv: { flexBasis: "47%", flexGrow: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  kvLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  kvValue: { color: Colors.text, fontSize: 13, fontWeight: "700", marginTop: 4 },
  assignedKicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  modLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  modValue: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 2 },
  miniRow: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  miniLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  miniValue: { color: Colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3, marginTop: 4 },
  histDot: { width: 10, height: 10, borderRadius: 99, marginTop: 6 },
  histLine: { width: 2, backgroundColor: "rgba(120,180,255,0.15)", height: 16, marginLeft: 4, marginVertical: 4 },
  histType: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  histMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  histNote: { color: Colors.textDim, fontSize: 12, marginTop: 3, fontStyle: "italic" },
  uploadBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(94,231,255,0.4)", backgroundColor: "rgba(94,231,255,0.10)" },
  uploadText: { color: Colors.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  inspectCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 16, backgroundColor: "#1E5BFF", marginTop: 4 },
  inspectCtaText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
