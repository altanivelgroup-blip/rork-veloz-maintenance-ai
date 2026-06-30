import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Activity, Battery, Calendar, ChevronRight, CircleDot, ClipboardList, Cog, Disc, Droplet, FileText,
  Fuel, Gauge, IdCard, Info, Link as LinkIcon, Plug, Settings2, ShieldCheck, Thermometer, Wind, Wrench, Zap, ShieldAlert,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AssetBlueprint from "@/components/AssetBlueprint";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import Card from "@/components/Card";
import HealthGauge from "@/components/HealthGauge";
import InsightCard from "@/components/InsightCard";
import InspectionSyncBadge from "@/components/InspectionSyncBadge";
import MetricBar from "@/components/MetricBar";
import AssetIncidentHistory from "@/components/AssetIncidentHistory";
import { KV, ModuleRow, Divider, MiniStat } from "@/components/AssetHelpers";
import RoadReadyBadge from "@/components/RoadReadyBadge";
import StatusBadge from "@/components/StatusBadge";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import ServiceScheduleCard from "@/components/ServiceScheduleCard";
import TruckSilhouette from "@/components/TruckSilhouette";
import TruckFuelTab from "@/components/TruckFuelTab";
import WarrantyBanner from "@/components/WarrantyBanner";
import ShopRepairTicket from "@/components/ShopRepairTicket";
import { Colors, statusMeta } from "@/constants/colors";
import { truckSubtypeMeta, serviceUrgencyMeta, serviceTypeMeta, serviceProviderMeta } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";
import { formatMiles, formatDecimal, formatServiceDue, formatVolts, formatRepairMeta, formatMilesCompact } from "@/utils/format";

type TruckTab = "overview" | "fuel";

export default function TruckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTruck, getTrailer, getCurrentOperator, getServiceUrgency, getWarrantyCoverage, getMaintenanceLockState } = useFleet();
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TruckTab>("overview");
  const [repairTicket, setRepairTicket] = useState<{ open: boolean; component: string; notes: string }>({ open: false, component: "", notes: "" });

  const openRepairTicket = (component: string, notes = "") => setRepairTicket({ open: true, component, notes });
  const closeRepairTicket = () => setRepairTicket({ open: false, component: "", notes: "" });
  const truck = getTruck(id ?? "");
  if (!truck) return <Screen><Text style={{ color: Colors.text }}>Truck not found</Text></Screen>;

  const trailer = truck.assignedTrailerId ? getTrailer(truck.assignedTrailerId) : undefined;
  const operator = getCurrentOperator(truck.id);
  const subtypeInfo = truckSubtypeMeta[truck.subtype];

  const tabs: { key: TruckTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "fuel", label: "Fuel & Efficiency" },
  ];

  return (
    <>
      <Stack.Screen options={{ title: truck.nickname }} />
      <Screen scroll={false}>
        {/* Segmented Tab Control */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "fuel" ? (
          <TruckFuelTab truck={truck} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Card glow={truck.roadReadyStatus !== "road_ready"}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{truck.cdl} · {truck.fuelType} · {subtypeInfo.label}</Text>
              <Text style={styles.h1}>{truck.nickname}</Text>
              <Text style={styles.sub}>{truck.year} {truck.make} {truck.model} {truck.trim}</Text>
              <View style={{ marginTop: 8, gap: 6 }}>
                <RoadReadyBadge status={truck.roadReadyStatus} />
                <AvailabilityBadge state={truck.availability} />
                <View style={styles.operatorRow}>
                  <Text style={styles.operatorLabel}>Current Operator </Text>
                  <Text style={[styles.operatorName, { color: operator ? Colors.cyan : Colors.textDim }]}>
                    {operator ? operator.name : "Unmanned — Staged"}
                  </Text>
                </View>
              </View>
            </View>
            <HealthGauge value={truck.health} size={104} label="Health" />
          </View>
          {/* Tap silhouette → Asset Blueprint */}
          <Pressable onPress={() => setBlueprintOpen(true)}>
            <View style={styles.silhouetteWrap}>
              <TruckSilhouette subtype={truck.subtype} tint={statusMeta[truck.status].color} width={300} height={140} />
              <View style={styles.blueprintHint}>
                <Info color={Colors.textDim} size={12} />
                <Text style={styles.blueprintHintText}>Tap for asset blueprint</Text>
              </View>
            </View>
          </Pressable>
          {/* Inspection sync */}
          <View style={{ marginBottom: 10 }}>
            <InspectionSyncBadge lastInspectionAt={truck.lastInspectionAt} lastInspectionResult={truck.lastInspectionResult} />
          </View>
          <View style={styles.kvGrid}>
            <KV icon={<Gauge color={Colors.electric} size={14} />} label="Mileage" value={formatMiles(truck.mileage)} />
            <KV icon={<Fuel color={Colors.electric} size={14} />} label="Avg MPG" value={formatDecimal(truck.avgMpg)} />
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
          <ModuleRow icon={<Droplet color={Colors.cyan} size={16} />} label="Oil service" value={formatServiceDue(truck.modules.engine.oilDueIn)} status={truck.modules.engine.oilDueIn < 0 ? "out" : truck.modules.engine.oilDueIn < 2000 ? "attention" : "operational"} onPress={() => openRepairTicket("Oil service", `Oil service ${truck.modules.engine.oilDueIn < 0 ? "overdue by " + Math.abs(truck.modules.engine.oilDueIn).toLocaleString() + " mi" : "due in " + truck.modules.engine.oilDueIn.toLocaleString() + " mi"}`)} />
          <Divider />
          <ModuleRow icon={<Plug color={Colors.cyan} size={16} />} label="DEF level" value={`${truck.modules.engine.defLevel}%`} status={truck.modules.engine.defLevel < 15 ? "out" : truck.modules.engine.defLevel < 35 ? "attention" : "operational"} />
          <View style={{ marginTop: 8 }}>
            <MetricBar label="DEF tank" value={truck.modules.engine.defLevel} good={50} warn={20} />
          </View>
          <Divider />
          <ModuleRow icon={<Thermometer color={Colors.cyan} size={16} />} label="Coolant" value="Reservoir & temp" status={truck.modules.engine.coolant} onPress={() => openRepairTicket("Coolant system", "Check reservoir level and operating temperature")} />
          <Divider />
          <ModuleRow icon={<Wind color={Colors.cyan} size={16} />} label="Belts" value="Serpentine & accessory" status={truck.modules.engine.belts} onPress={() => openRepairTicket("Belts", "Inspect serpentine & accessory belts")} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Transmission" />
        <Card>
          <ModuleRow icon={<Cog color={Colors.cyan} size={16} />} label="Fluid service" value={formatServiceDue(truck.modules.transmission.fluidDueIn)} status={truck.modules.transmission.fluidDueIn < 5000 ? "attention" : "operational"} onPress={() => openRepairTicket("Transmission fluid", `Fluid service due in ${truck.modules.transmission.fluidDueIn.toLocaleString()} mi`)} />
          <Divider />
          <ModuleRow icon={<Settings2 color={Colors.cyan} size={16} />} label="Service interval" value={formatMiles(truck.modules.transmission.serviceInterval)} status="operational" />
        </Card>

        <SectionHeader kicker="Maintenance" title="Brakes" />
        <Card>
          <View style={{ gap: 14 }}>
            <MetricBar label="Pad life" value={truck.modules.brakes.padPct} />
            <MetricBar label="Rotor life" value={truck.modules.brakes.rotorPct} />
            <ModuleRow icon={<Droplet color={Colors.cyan} size={16} />} label="Brake fluid" value="Reservoir level" status={truck.modules.brakes.fluid} onPress={() => openRepairTicket("Brake fluid", "Check reservoir level and fluid condition")} />
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Tires" />
        <Card>
          <View style={{ gap: 14 }}>
            <MetricBar label="Tread remaining" value={truck.modules.tires.wearPct} />
            <View style={styles.miniRow}>
              <MiniStat label="Age" value={`${truck.modules.tires.ageMonths} mo`} />
              <MiniStat label="Last rotation" value={formatMilesCompact(truck.modules.tires.lastRotation)} />
              <MiniStat label="Blowouts" value={`${truck.modules.tires.blowouts}`} />
            </View>
          </View>
        </Card>

        <SectionHeader kicker="Maintenance" title="Suspension" />
        <Card>
          <ModuleRow icon={<CircleDot color={Colors.cyan} size={16} />} label="Airbags" value="Pressure & condition" status={truck.modules.suspension.airbags} onPress={() => openRepairTicket("Airbags", "Check pressure & condition")} />
          <Divider />
          <ModuleRow icon={<Disc color={Colors.cyan} size={16} />} label="Shocks & springs" value="Damping & ride height" status={truck.modules.suspension.shocks} onPress={() => openRepairTicket("Shocks & springs", "Check damping & ride height")} />
        </Card>

        <SectionHeader kicker="Maintenance" title="Electrical" />
        <Card>
          <ModuleRow icon={<Battery color={Colors.cyan} size={16} />} label="Battery" value={`${formatVolts(truck.modules.electrical.batteryVolts)} resting`} status={truck.modules.electrical.batteryVolts < 12.2 ? "attention" : "operational"} onPress={() => openRepairTicket("Battery", `Resting voltage ${truck.modules.electrical.batteryVolts.toFixed(1)} V`)} />
          <Divider />
          <ModuleRow icon={<Zap color={Colors.cyan} size={16} />} label="Alternator" value="Charging output" status={truck.modules.electrical.alternator} onPress={() => openRepairTicket("Alternator", "Check charging output")} />
          <Divider />
          <ModuleRow icon={<Plug color={Colors.cyan} size={16} />} label="Trailer wiring" value="7-pin harness" status={truck.modules.electrical.trailerWiring} onPress={() => openRepairTicket("Trailer wiring", "Inspect 7-pin harness")} />
        </Card>

        <SectionHeader kicker="Compliance" title="DOT & Documents" />
        <Card>
          <ModuleRow icon={<ShieldCheck color={Colors.cyan} size={16} />} label="DOT inspection" value={`Due ${truck.modules.compliance.dotDue}`} status="operational" />
          <Divider />
          <ModuleRow icon={<FileText color={Colors.cyan} size={16} />} label="Insurance" value={`Renews ${truck.modules.compliance.insuranceDue}`} status="operational" />
          <Divider />
          <ModuleRow icon={<Calendar color={Colors.cyan} size={16} />} label="Registration" value={`Renews ${truck.modules.compliance.registrationDue}`} status="operational" />
        </Card>

        {/* Service Schedules */}
        <SectionHeader kicker="Preventative Maintenance" title="Service Schedules" />
        <View style={{ gap: 10 }}>
          {getServiceUrgency(truck.id).map((s, idx) => (
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
        {getMaintenanceLockState(truck.id).locked && (
          <Pressable onPress={() => openRepairTicket("Critical lockout", getMaintenanceLockState(truck.id).reason)}>
            <View style={styles.lockoutBanner}>
              <ShieldAlert color={Colors.urgencyBlinkRed} size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lockoutTitle}>Maintenance Lockout Active</Text>
                <Text style={styles.lockoutDesc}>{getMaintenanceLockState(truck.id).reason}</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Warranty */}
        <SectionHeader kicker="Coverage" title="Warranty Protection" />
        <WarrantyBanner warranty={truck.warranty} />

        {/* History — Repair Records */}
        <SectionHeader kicker="History" title="Service Timeline" />
        {truck.history.length === 0 && truck.repairRecords.length === 0 ? (
          <Card><Text style={{ color: Colors.textMuted, fontSize: 13 }}>No service records yet.</Text></Card>
        ) : (
          <View style={{ gap: 6 }}>
            {truck.repairRecords.map((rec) => (
              <Card key={rec.recordId}>
                <View style={styles.repairHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repairWo}>WO: {rec.workOrderNumber}</Text>
                    <Text style={styles.repairMeta}>{formatRepairMeta(rec.completionDate, rec.odometerAtService, rec.totalCost)}</Text>
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
        <SectionHeader kicker="Vault" title="Equipment Documents" />
        <Card>
          {[
            { label: "Registration", expires: truck.modules.compliance.registrationDue, icon: <FileText color={Colors.cyan} size={16} /> },
            { label: "Insurance", expires: truck.modules.compliance.insuranceDue, icon: <ShieldCheck color={Colors.cyan} size={16} /> },
            { label: "DOT inspection", expires: truck.modules.compliance.dotDue, icon: <ClipboardList color={Colors.cyan} size={16} /> },
            { label: "Warranty docs", expires: truck.warranty ? truck.warranty.expirationDate : "—", icon: <Wrench color={Colors.cyan} size={16} /> },
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

        <Pressable onPress={() => router.push("/inspection/new")}>
          <View style={styles.inspectCta}>
            <Activity color="#fff" size={18} />
            <Text style={styles.inspectCtaText}>Run inspection on {truck.nickname}</Text>
          </View>
        </Pressable>

        {/* Asset Incident History */}
        <AssetIncidentHistory assetId={truck.id} assetName={truck.nickname} />

        <View style={{ height: 80 }} />
          </ScrollView>
        )}

        {/* Asset Blueprint Drawer */}
        <AssetBlueprint visible={blueprintOpen} asset={truck} kind="truck" onClose={() => setBlueprintOpen(false)} />

        {/* Shop Repair Ticket Drawer */}
        <ShopRepairTicket
          visible={repairTicket.open}
          asset={truck}
          componentLabel={repairTicket.component}
          initialNotes={repairTicket.notes}
          onClose={closeRepairTicket}
        />
      </Screen>
    </>
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
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  kvGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  assignedKicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  miniRow: { flexDirection: "row", gap: 8 },
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
  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.panelHi,
  },
  tabText: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: Colors.cyan,
  },
});
