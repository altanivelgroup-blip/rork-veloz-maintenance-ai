import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Activity, Calendar, ChevronRight, ClipboardList, Disc, FileText, Info, Layers,
  Lightbulb, Link as LinkIcon, Ruler, ShieldCheck, ShieldAlert, Truck, Wrench, Anchor,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AssetBlueprint from "@/components/AssetBlueprint";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import InsightCard from "@/components/InsightCard";
import InspectionSyncBadge from "@/components/InspectionSyncBadge";
import MetricBar from "@/components/MetricBar";
import RoadReadyBadge from "@/components/RoadReadyBadge";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import ServiceScheduleCard from "@/components/ServiceScheduleCard";
import StatusBadge from "@/components/StatusBadge";
import TrailerSilhouette from "@/components/TrailerSilhouette";
import WarrantyBanner from "@/components/WarrantyBanner";
import { Colors, statusMeta } from "@/constants/colors";
import { trailerSubtypeMeta, serviceTypeMeta, serviceProviderMeta } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";

export default function TrailerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTrailer, getTruck, getCurrentOperator, getServiceUrgency, getWarrantyCoverage, getMaintenanceLockState } = useFleet();
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const trailer = getTrailer(id ?? "");
  if (!trailer) return <Screen><Text style={{ color: Colors.text }}>Trailer not found</Text></Screen>;

  const truck = trailer.assignedTruckId ? getTruck(trailer.assignedTruckId) : undefined;
  const operator = getCurrentOperator(trailer.id);
  const subtypeInfo = trailerSubtypeMeta[trailer.subtype];

  return (
    <>
      <Stack.Screen options={{ title: trailer.nickname }} />
      <Screen>
        {/* Hero */}
        <Card glow={trailer.roadReadyStatus !== "road_ready"}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{trailer.type} · {trailer.enclosed ? "Enclosed" : "Open"} · {subtypeInfo.label}</Text>
              <Text style={styles.h1}>{trailer.nickname}</Text>
              <Text style={styles.sub}>{trailer.year} {trailer.make} {trailer.model}</Text>
              <View style={{ marginTop: 8, gap: 6 }}>
                <RoadReadyBadge status={trailer.roadReadyStatus} />
                <AvailabilityBadge state={trailer.availability} />
                <View style={styles.operatorRow}>
                  <Text style={styles.operatorLabel}>Current Operator </Text>
                  <Text style={[styles.operatorName, { color: operator ? Colors.cyan : Colors.textDim }]}>
                    {operator ? operator.name : "Unmanned — Staged"}
                  </Text>
                </View>
              </View>
            </View>
            <HealthGauge value={trailer.health} size={104} label="Health" />
          </View>
          <Pressable onPress={() => setBlueprintOpen(true)}>
            <View style={styles.silhouetteWrap}>
              <TrailerSilhouette subtype={trailer.subtype} tint={statusMeta[trailer.status].color} width={300} height={120} />
              <View style={styles.blueprintHint}>
                <Info color={Colors.textDim} size={12} />
                <Text style={styles.blueprintHintText}>Tap for asset blueprint</Text>
              </View>
            </View>
          </Pressable>
          <View style={{ marginBottom: 10 }}>
            <InspectionSyncBadge lastInspectionAt={trailer.lastInspectionAt} lastInspectionResult={trailer.lastInspectionResult} />
          </View>
          <View style={styles.kvGrid}>
            <KV icon={<Ruler color={Colors.electric} size={14} />} label="Length" value={`${trailer.length} ft`} />
            <KV icon={<Layers color={Colors.electric} size={14} />} label="Axles" value={`${trailer.axles}`} />
            <KV icon={<Anchor color={Colors.electric} size={14} />} label="GVWR" value={`${(trailer.gvwr / 1000).toFixed(1)}k lb`} />
            <KV icon={<Truck color={Colors.electric} size={14} />} label="Capacity" value={`${trailer.carCapacity} car${trailer.carCapacity > 1 ? "s" : ""}`} />
          </View>
        </Card>

        {/* Assigned truck */}
        {truck && (
          <Pressable onPress={() => router.push(`/truck/${truck.id}`)}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.15)" }]}>
                  <LinkIcon color={Colors.cyan} size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignedKicker}>ASSIGNED TRUCK</Text>
                  <Text style={styles.title}>{truck.nickname}</Text>
                  <Text style={styles.sub2}>{truck.year} {truck.make} {truck.model}</Text>
                </View>
                <StatusBadge status={truck.status} />
                <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 4 }} />
              </View>
            </Card>
          </Pressable>
        )}

        {/* AI Insights */}
        <SectionHeader kicker="AI · Trailer Intelligence" title="Insights" />
        <View style={{ gap: 10 }}>
          {trailer.insights.map((i) => (
            <InsightCard key={i.id} severity={i.severity} title={i.title} detail={i.detail} />
          ))}
        </View>

        {/* Modules */}
        <SectionHeader kicker="Maintenance" title="Bearings" />
        <Card>
          <ModuleRow
            icon={<Disc color={Colors.cyan} size={16} />}
            label="Last service"
            value={`${trailer.modules.bearings.lastServiceMiles.toLocaleString()} mi ago · interval ${trailer.modules.bearings.intervalMiles.toLocaleString()} mi`}
            status={trailer.modules.bearings.lastServiceMiles > trailer.modules.bearings.intervalMiles ? "attention" : "operational"}
          />
          <View style={{ marginTop: 8 }}>
            <MetricBar
              label="Service interval used"
              value={Math.min(100, (trailer.modules.bearings.lastServiceMiles / trailer.modules.bearings.intervalMiles) * 100)}
              good={50}
              warn={80}
            />
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Brakes" />
        <Card>
          <MetricBar label="Brake wear remaining" value={trailer.modules.brakes.wearPct} />
          <View style={styles.divider} />
          <ModuleRow icon={<Wrench color={Colors.cyan} size={16} />} label="Last adjustment" value={trailer.modules.brakes.lastAdjust} status={trailer.modules.brakes.wearPct < 25 ? "out" : trailer.modules.brakes.wearPct < 50 ? "attention" : "operational"} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Tires" />
        <Card>
          <MetricBar label="Tread remaining" value={trailer.modules.tires.treadPct} />
          <View style={styles.miniRow}>
            <MiniStat label="Age" value={`${trailer.modules.tires.ageMonths} mo`} />
            <MiniStat label="Blowouts" value={`${trailer.modules.tires.blowouts}`} />
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Lighting" />
        <Card>
          <ModuleRow icon={<Lightbulb color={Colors.cyan} size={16} />} label="Brake lights" value="Stop & turn signals" status={trailer.modules.lighting.brake} />
          <Divider />
          <ModuleRow icon={<Lightbulb color={Colors.cyan} size={16} />} label="Marker lights" value="Side & clearance" status={trailer.modules.lighting.marker} />
          <Divider />
          <ModuleRow icon={<Lightbulb color={Colors.cyan} size={16} />} label="Wiring" value="7-pin harness" status={trailer.modules.lighting.wiring} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Straps & Chains" />
        <Card>
          <ModuleRow icon={<Layers color={Colors.cyan} size={16} />} label="Inventory" value={`${trailer.modules.straps.goodCount} good · ${trailer.modules.straps.replaceSoon} replace soon`} status={trailer.modules.straps.replaceSoon > 2 ? "attention" : "operational"} />
          <Divider />
          <ModuleRow icon={<Calendar color={Colors.cyan} size={16} />} label="Next replacement" value={trailer.modules.straps.replaceDate} status="operational" />
        </Card>

        <SectionHeader kicker="Maintenance" title="Ramps & Winch" />
        <Card>
          <ModuleRow icon={<Anchor color={Colors.cyan} size={16} />} label="Ramps operational" value="Loading & retract" status={trailer.modules.ramps.operational} />
          <View style={{ marginTop: 12 }}>
            <MetricBar label="Winch cable life" value={100 - trailer.modules.ramps.cableWearPct} good={70} warn={40} />
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Deck Condition" />
        <Card>
          <ModuleRow icon={<Layers color={Colors.cyan} size={16} />} label="Rust" value="Deck surface" status={trailer.modules.deck.rust} />
          <Divider />
          <ModuleRow icon={<Layers color={Colors.cyan} size={16} />} label="Cracking" value="Stress points" status={trailer.modules.deck.cracking} />
          <Divider />
          <ModuleRow icon={<Wrench color={Colors.cyan} size={16} />} label="Weld inspection" value="Joints & supports" status={trailer.modules.deck.welds} />
        </Card>

        {/* Service Schedules */}
        <SectionHeader kicker="Preventative Maintenance" title="Service Schedules" />
        <View style={{ gap: 10 }}>
          {getServiceUrgency(trailer.id).map((s, idx) => (
            <ServiceScheduleCard
              key={`${s.schedule.level}-${idx}`}
              schedule={s.schedule}
              urgency={s.urgency}
              remainingMiles={s.remainingMiles}
              remainingDays={s.remainingDays}
              nextDue={s.nextDue}
            />
          ))}
        </View>

        {/* Maintenance Lockout Warning */}
        {getMaintenanceLockState(trailer.id).locked && (
          <View style={styles.lockoutBanner}>
            <ShieldAlert color={Colors.urgencyBlinkRed} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockoutTitle}>Maintenance Lockout Active</Text>
              <Text style={styles.lockoutDesc}>{getMaintenanceLockState(trailer.id).reason}</Text>
            </View>
          </View>
        )}

        {/* Warranty */}
        <SectionHeader kicker="Coverage" title="Warranty Protection" />
        <WarrantyBanner warranty={trailer.warranty} />

        {/* History — Repair Records */}
        <SectionHeader kicker="History" title="Service Timeline" />
        {trailer.history.length === 0 && trailer.repairRecords.length === 0 ? (
          <Card><Text style={{ color: Colors.textMuted, fontSize: 13 }}>No service records yet.</Text></Card>
        ) : (
          <View style={{ gap: 6 }}>
            {trailer.repairRecords.map((rec) => (
              <Card key={rec.recordId}>
                <View style={styles.repairHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repairWo}>WO: {rec.workOrderNumber}</Text>
                    <Text style={styles.repairMeta}>{rec.completionDate}{rec.odometerAtService ? ` · ${rec.odometerAtService.toLocaleString()} mi` : ""} · ${rec.totalCost}</Text>
                  </View>
                  <View style={[styles.providerBadge, {
                    backgroundColor: rec.serviceProvider === "internal" ? "rgba(94,231,255,0.12)" : "rgba(255,181,71,0.12)",
                    borderColor: rec.serviceProvider === "internal" ? Colors.cyan : Colors.amber,
                  }]}>
                    <Text style={[styles.providerText, { color: rec.serviceProvider === "internal" ? Colors.cyan : Colors.amber }]}>
                      {serviceProviderMeta[rec.serviceProvider]}
                    </Text>
                  </View>
                </View>
                {rec.lineItems.length > 0 && (
                  <View style={styles.lineItems}>
                    {rec.lineItems.map((li) => (
                      <View key={li.id} style={styles.lineItem}>
                        <View style={[styles.lineDot, { backgroundColor: li.serviceType === "repair" ? Colors.amber : li.serviceType === "replacement" ? Colors.red : Colors.cyan }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lineComp}>{li.component}</Text>
                          <Text style={styles.lineType}>{serviceTypeMeta[li.serviceType]}{li.cost ? ` · $${li.cost}` : ""}</Text>
                          {li.notes && <Text style={styles.lineNote}>{li.notes}</Text>}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {rec.notes && <Text style={styles.recNotes}>{rec.notes}</Text>}
              </Card>
            ))}
          </View>
        )}

        {/* Documents */}
        <SectionHeader kicker="Vault" title="Trailer Documents" />
        <Card>
          {[
            { label: "Registration", expires: "2026-09-12", icon: <FileText color={Colors.cyan} size={16} /> },
            { label: "Annual inspection", expires: "2026-10-04", icon: <ClipboardList color={Colors.cyan} size={16} /> },
            { label: "Warranty", expires: trailer.warranty ? trailer.warranty.expirationDate : "—", icon: <ShieldCheck color={Colors.cyan} size={16} /> },
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
              {i < 2 && <Divider />}
            </View>
          ))}
        </Card>

        <Pressable onPress={() => router.push("/inspection/new")}>
          <View style={styles.inspectCta}>
            <Activity color="#fff" size={18} />
            <Text style={styles.inspectCtaText}>Run inspection on {trailer.nickname}</Text>
          </View>
        </Pressable>

        {/* Asset Blueprint Drawer */}
        <AssetBlueprint visible={blueprintOpen} asset={trailer} kind="trailer" onClose={() => setBlueprintOpen(false)} />
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
      <Text style={styles.kvValue}>{value}</Text>
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
  silhouetteWrap: { alignItems: "center", marginTop: 6, marginBottom: 4 },
  blueprintHint: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, opacity: 0.6 },
  blueprintHintText: { color: Colors.textDim, fontSize: 10, fontWeight: "600" },
  kvGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  kv: { flexBasis: "47%", flexGrow: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  kvLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  kvValue: { color: Colors.text, fontSize: 13, fontWeight: "700", marginTop: 4 },
  assignedKicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  modLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  modValue: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 6 },
  miniRow: { flexDirection: "row", gap: 8, marginTop: 12 },
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
  operatorRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border, alignSelf: "flex-start" },
  operatorLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  operatorName: { fontSize: 11, fontWeight: "800" },
  // Lockout
  lockoutBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, marginTop: 4,
    backgroundColor: "rgba(255,51,102,0.1)", borderWidth: 1.5, borderColor: "rgba(255,51,102,0.45)",
  },
  lockoutTitle: { color: Colors.urgencyBlinkRed, fontSize: 14, fontWeight: "800" },
  lockoutDesc: { color: "rgba(255,140,160,0.9)", fontSize: 12, marginTop: 2, lineHeight: 17 },
  // Repair records
  repairHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  repairWo: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  repairMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  providerBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1,
  },
  providerText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  lineItems: { marginTop: 10, gap: 8, paddingLeft: 2 },
  lineItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  lineDot: { width: 8, height: 8, borderRadius: 99, marginTop: 5 },
  lineComp: { color: Colors.text, fontSize: 13, fontWeight: "700" },
  lineType: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  lineNote: { color: Colors.textDim, fontSize: 11, marginTop: 2, fontStyle: "italic" },
  recNotes: { color: Colors.textDim, fontSize: 11, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", fontStyle: "italic" },
});
