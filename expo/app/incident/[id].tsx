import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  AlertOctagon,
  AlertTriangle,
  BatteryWarning,
  Camera,
  CarFront,
  CircleCheck,
  CircleDot,
  Container,
  Disc3,
  FileText,
  Gauge,
  MapPin,
  ShieldAlert,
  Truck,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients, statusMeta } from "@/constants/colors";
import {
  INCIDENT_SEVERITY_META,
  INCIDENT_STATUS_META,
  INCIDENT_TYPE_LABEL,
  type Incident,
  type IncidentStatus,
} from "@/constants/incidentData";
import { useFleet } from "@/providers/FleetProvider";

const TYPE_ICON: Record<Incident["type"], LucideIcon> = {
  breakdown: AlertOctagon,
  tire: Disc3,
  brakes: CircleDot,
  electrical: BatteryWarning,
  accident: CarFront,
  mechanical: Wrench,
  compliance: ShieldAlert,
  other: AlertTriangle,
};

function hap() {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
}

export default function IncidentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getIncident, updateIncidentStatus } = useFleet();
  const incident = getIncident(id);
  const [note, setNote] = useState<string>("");

  const accent = useMemo(
    () => (incident ? statusMeta[INCIDENT_SEVERITY_META[incident.severity].status].color : Colors.electric),
    [incident],
  );

  if (!incident) {
    return (
      <>
        <Stack.Screen options={{ title: "Incident" }} />
        <Screen>
          <Text style={{ color: Colors.text }}>Incident not found</Text>
        </Screen>
      </>
    );
  }

  const Icon = TYPE_ICON[incident.type];
  const EqIcon = incident.equipmentKind === "truck" ? Truck : Container;
  const sev = INCIDENT_SEVERITY_META[incident.severity];

  function advance(status: IncidentStatus) {
    if (!incident) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    updateIncidentStatus(incident.id, status, note.trim() || undefined);
    setNote("");
  }

  return (
    <>
      <Stack.Screen options={{ title: incident.code }} />
      <Screen>
        {/* Hero */}
        <Card glow gradient={Gradients.cardHi}>
          <View style={styles.heroTop}>
            <View style={[styles.iconWrap, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <Icon color={accent} size={24} />
            </View>
            <View style={[styles.sevPill, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <View style={[styles.sevDot, { backgroundColor: accent }]} />
              <Text style={[styles.sevText, { color: accent }]}>{sev.label.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{incident.title}</Text>
          <Text style={styles.heroSummary}>{incident.summary}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusChip, statusChipStyle(incident.status)]}>
              <Text style={[styles.statusText, { color: statusChipColor(incident.status) }]}>
                {INCIDENT_STATUS_META[incident.status].label}
              </Text>
            </View>
            <Text style={styles.tag}>{INCIDENT_TYPE_LABEL[incident.type]}</Text>
          </View>
        </Card>

        {/* Equipment + meta */}
        <Card>
          <View style={styles.metaHead}>
            <View style={[styles.eqBubble]}>
              <EqIcon color={Colors.cyan} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{incident.equipmentKind === "truck" ? "TRUCK" : "TRAILER"}</Text>
              <Text style={styles.eqName}>{incident.equipmentName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <MetaRow icon={MapPin} label="Location" value={incident.location} />
          {incident.mileage !== undefined && (
            <MetaRow icon={Gauge} label="Mileage" value={`${incident.mileage.toLocaleString()} mi`} />
          )}
          <MetaRow icon={User} label="Reported by" value={`${incident.reportedBy} · ${incident.reportedAt}`} />
          <MetaRow icon={Camera} label="Evidence" value={`${incident.photos} photo${incident.photos !== 1 ? "s" : ""} attached`} />
        </Card>

        {/* Timeline */}
        <SectionHeader kicker="Activity" title="Incident Timeline" />
        <Card>
          {(incident.timeline ?? []).map((ev, idx, arr) => {
            const c = eventColor(ev.kind);
            return (
              <View key={ev.id} style={styles.tlRow}>
                <View style={styles.tlRail}>
                  <View style={[styles.tlNode, { borderColor: c, backgroundColor: c + "22" }]} />
                  {idx < arr.length - 1 && <View style={styles.tlLine} />}
                </View>
                <View style={{ flex: 1, paddingBottom: idx < arr.length - 1 ? 18 : 0 }}>
                  <View style={styles.tlHead}>
                    <Text style={styles.tlLabel}>{ev.label}</Text>
                    <Text style={styles.tlDate}>{ev.at}</Text>
                  </View>
                  {ev.detail ? <Text style={styles.tlDetail}>{ev.detail}</Text> : null}
                  <Text style={styles.tlBy}>{ev.by}</Text>
                </View>
              </View>
            );
          })}
          {(incident.timeline ?? []).length === 0 && (
            <Text style={styles.tlDetail}>No activity recorded yet.</Text>
          )}
        </Card>

        {/* Resolution note (resolved) */}
        {incident.status === "resolved" && incident.resolutionNote && (
          <Card gradient={Gradients.steel}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <CircleCheck color={Colors.green} size={16} />
              <Text style={styles.kicker}>RESOLUTION</Text>
            </View>
            <Text style={styles.resText}>{incident.resolutionNote}</Text>
          </Card>
        )}

        {/* Workflow actions */}
        {incident.status !== "resolved" && (
          <>
            <SectionHeader kicker="Workflow" title="Update Status" />
            <Card>
              <Text style={styles.label}>WORKFLOW NOTE (OPTIONAL)</Text>
              <TextInput
                placeholder="Add context for this status change..."
                placeholderTextColor={Colors.textDim}
                value={note}
                onChangeText={setNote}
                style={styles.noteInput}
                multiline
              />
              <View style={styles.actionRow}>
                {incident.status === "open" && (
                  <Pressable style={{ flex: 1 }} onPress={() => { hap(); advance("in_review"); }}>
                    <View style={[styles.secondaryBtn, { borderColor: Colors.amber + "66", backgroundColor: Colors.amber + "14" }]}>
                      <FileText color={Colors.amber} size={16} />
                      <Text style={[styles.secondaryText, { color: Colors.amber }]}>Move to Review</Text>
                    </View>
                  </Pressable>
                )}
                <Pressable style={{ flex: 1 }} onPress={() => advance("resolved")}>
                  <View style={styles.primaryBtn}>
                    <LinearGradient colors={Gradients.green} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                    <CircleCheck color="#fff" size={16} />
                    <Text style={styles.primaryText}>Mark Resolved</Text>
                  </View>
                </Pressable>
              </View>
            </Card>
          </>
        )}

        {incident.status === "resolved" && (
          <Pressable onPress={() => { hap(); advance("open"); }}>
            <View style={[styles.secondaryBtn, { borderColor: Colors.border, backgroundColor: Colors.glass }]}>
              <AlertTriangle color={Colors.textMuted} size={16} />
              <Text style={[styles.secondaryText, { color: Colors.textMuted }]}>Re-open Incident</Text>
            </View>
          </Pressable>
        )}

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back to Incident Center</Text>
        </Pressable>
      </Screen>
    </>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Icon color={Colors.textMuted} size={15} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function eventColor(kind: string): string {
  if (kind === "reported") return Colors.electric;
  if (kind === "in_review") return Colors.amber;
  if (kind === "resolved") return Colors.green;
  return Colors.cyan;
}

function statusChipColor(status: Incident["status"]): string {
  if (status === "open") return Colors.red;
  if (status === "in_review") return Colors.amber;
  return Colors.green;
}

function statusChipStyle(status: Incident["status"]) {
  const color = statusChipColor(status);
  return { backgroundColor: color + "1A", borderColor: color + "44" };
}

const styles = StyleSheet.create({
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  sevPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  sevDot: { width: 7, height: 7, borderRadius: 99 },
  sevText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { color: Colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3, marginTop: 14 },
  heroSummary: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  tag: { color: Colors.textDim, fontSize: 12, fontWeight: "700" },

  metaHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  eqBubble: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(94,231,255,0.12)", borderWidth: 1, borderColor: "rgba(94,231,255,0.3)" },
  kicker: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  eqName: { color: Colors.text, fontSize: 17, fontWeight: "800", marginTop: 3 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 14 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
  metaLabel: { color: Colors.textDim, fontSize: 12, fontWeight: "700", width: 92 },
  metaValue: { color: Colors.text, fontSize: 13, fontWeight: "700", flex: 1 },

  tlRow: { flexDirection: "row", gap: 12 },
  tlRail: { width: 16, alignItems: "center" },
  tlNode: { width: 14, height: 14, borderRadius: 99, borderWidth: 3, marginTop: 2 },
  tlLine: { flex: 1, width: 2, backgroundColor: "rgba(255,255,255,0.08)", marginTop: 2 },
  tlHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  tlLabel: { color: Colors.text, fontSize: 14, fontWeight: "800", flex: 1 },
  tlDate: { color: Colors.textDim, fontSize: 11, fontWeight: "700" },
  tlDetail: { color: Colors.textMuted, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  tlBy: { color: Colors.textDim, fontSize: 11, fontWeight: "700", marginTop: 5 },

  resText: { color: Colors.text, fontSize: 13.5, lineHeight: 20, marginTop: 8, fontWeight: "600" },

  label: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  noteInput: { color: Colors.text, fontSize: 13, padding: 12, marginTop: 10, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border, minHeight: 64 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 13, borderRadius: 14, overflow: "hidden" },
  primaryText: { color: "#fff", fontSize: 13.5, fontWeight: "800" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 13, borderRadius: 14, borderWidth: 1 },
  secondaryText: { fontSize: 13.5, fontWeight: "800" },
  backText: { color: Colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 4, fontWeight: "700" },
});
