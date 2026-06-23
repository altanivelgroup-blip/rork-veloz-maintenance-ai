import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import {
  AlertOctagon,
  AlertTriangle,
  BatteryWarning,
  Camera,
  CarFront,
  Check,
  ChevronRight,
  CircleDot,
  Container,
  Disc3,
  ShieldAlert,
  Truck,
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
  INCIDENT_TYPE_LABEL,
  type IncidentSeverity,
  type IncidentType,
} from "@/constants/incidentData";
import { useFleet } from "@/providers/FleetProvider";

type Kind = "truck" | "trailer";

const TYPE_ICON: Record<IncidentType, LucideIcon> = {
  breakdown: AlertOctagon,
  tire: Disc3,
  brakes: CircleDot,
  electrical: BatteryWarning,
  accident: CarFront,
  mechanical: Wrench,
  compliance: ShieldAlert,
  other: AlertTriangle,
};

const TYPES: IncidentType[] = ["breakdown", "tire", "brakes", "electrical", "accident", "mechanical", "compliance", "other"];
const SEVERITIES: IncidentSeverity[] = ["critical", "major", "minor"];

function hap() {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
}

export default function NewIncidentScreen() {
  const { trucks, trailers, addIncident } = useFleet();
  const [step, setStep] = useState<"equipment" | "details" | "review">("equipment");
  const [kind, setKind] = useState<Kind>("truck");
  const [eqId, setEqId] = useState<string | null>(null);
  const [type, setType] = useState<IncidentType>("breakdown");
  const [severity, setSeverity] = useState<IncidentSeverity>("major");
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [photos, setPhotos] = useState<number>(0);

  const list = kind === "truck" ? trucks : trailers;
  const equipment = useMemo(() => list.find((e) => e.id === eqId), [list, eqId]);

  const canDetails = title.trim().length > 1 && summary.trim().length > 1 && location.trim().length > 1;

  function submit() {
    if (!equipment) return;
    const created = addIncident({
      title: title.trim(),
      summary: summary.trim(),
      type,
      severity,
      equipmentKind: kind,
      equipmentId: equipment.id,
      equipmentName: equipment.nickname,
      location: location.trim(),
      mileage: kind === "truck" ? (equipment as { mileage?: number }).mileage : undefined,
      reportedBy: "You",
      photos,
    });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace(`/incident/${created.id}`);
  }

  // STEP 1 — equipment
  if (step === "equipment") {
    return (
      <>
        <Stack.Screen options={{ title: "New Incident" }} />
        <Screen>
          <SectionHeader kicker="Step 1 of 3" title="Which unit is affected?" />

          <Text style={styles.label}>EQUIPMENT TYPE</Text>
          <View style={styles.dualBtn}>
            <Pressable style={[styles.toggle, kind === "truck" && styles.toggleOn]} onPress={() => { setKind("truck"); setEqId(null); hap(); }}>
              <Truck color={kind === "truck" ? "#fff" : Colors.textMuted} size={18} />
              <Text style={[styles.toggleText, kind === "truck" && styles.toggleTextOn]}>Truck</Text>
            </Pressable>
            <Pressable style={[styles.toggle, kind === "trailer" && styles.toggleOn]} onPress={() => { setKind("trailer"); setEqId(null); hap(); }}>
              <Container color={kind === "trailer" ? "#fff" : Colors.textMuted} size={18} />
              <Text style={[styles.toggleText, kind === "trailer" && styles.toggleTextOn]}>Trailer</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>SELECT {kind === "truck" ? "TRUCK" : "TRAILER"}</Text>
          <View style={{ gap: 8 }}>
            {list.map((eq) => (
              <Pressable key={eq.id} onPress={() => { setEqId(eq.id); hap(); }}>
                <View style={[styles.eqPick, eqId === eq.id && styles.eqPickOn]}>
                  <View style={styles.iconBubble}>
                    {kind === "truck" ? <Truck color={Colors.cyan} size={18} /> : <Container color={Colors.cyan} size={18} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eqName}>{eq.nickname}</Text>
                    <Text style={styles.eqSub}>{eq.year} {eq.make} {eq.model}</Text>
                  </View>
                  {eqId === eq.id && <Check color={Colors.cyan} size={20} />}
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable disabled={!eqId} onPress={() => { setStep("details"); hap(); }}>
            <View style={[styles.primary, !eqId && { opacity: 0.4 }]}>
              <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.primaryText}>Continue</Text>
              <ChevronRight color="#fff" size={20} />
            </View>
          </Pressable>
        </Screen>
      </>
    );
  }

  // STEP 2 — details
  if (step === "details") {
    return (
      <>
        <Stack.Screen options={{ title: "New Incident" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 3" title="Describe the incident" />

          <Text style={styles.label}>INCIDENT TYPE</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => {
              const Icon = TYPE_ICON[t];
              const on = type === t;
              return (
                <Pressable key={t} onPress={() => { setType(t); hap(); }} style={styles.typeCell}>
                  <View style={[styles.typeChip, on && styles.typeChipOn]}>
                    <Icon color={on ? Colors.cyan : Colors.textMuted} size={16} />
                    <Text style={[styles.typeText, on && { color: Colors.cyan }]}>{INCIDENT_TYPE_LABEL[t]}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>SEVERITY</Text>
          <View style={styles.dualBtn}>
            {SEVERITIES.map((s) => {
              const meta = INCIDENT_SEVERITY_META[s];
              const color = statusMeta[meta.status].color;
              const on = severity === s;
              return (
                <Pressable key={s} style={{ flex: 1 }} onPress={() => { setSeverity(s); hap(); }}>
                  <View style={[styles.sevBtn, on && { borderColor: color, backgroundColor: color + "1A" }]}>
                    <View style={[styles.sevDot, { backgroundColor: color }]} />
                    <Text style={[styles.sevBtnText, on && { color }]}>{meta.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>TITLE</Text>
          <TextInput
            placeholder="e.g. Coolant temperature spike on I-20"
            placeholderTextColor={Colors.textDim}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>WHAT HAPPENED</Text>
          <TextInput
            placeholder="Describe the situation, symptoms, and any action taken..."
            placeholderTextColor={Colors.textDim}
            value={summary}
            onChangeText={setSummary}
            style={[styles.input, { minHeight: 96 }]}
            multiline
          />

          <Text style={styles.label}>LOCATION</Text>
          <TextInput
            placeholder="e.g. I-20 W · Abilene, TX"
            placeholderTextColor={Colors.textDim}
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />

          <Pressable onPress={() => { setPhotos((n) => n + 1); hap(); }}>
            <View style={styles.photoBtn}>
              <Camera color={Colors.cyan} size={18} />
              <Text style={styles.photoText}>Attach photo evidence</Text>
              {photos > 0 && (
                <View style={styles.photoBadge}>
                  <Text style={styles.photoBadgeText}>{photos}</Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable disabled={!canDetails} onPress={() => { setStep("review"); hap(); }}>
            <View style={[styles.primary, !canDetails && { opacity: 0.4 }]}>
              <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.primaryText}>Review Report</Text>
              <ChevronRight color="#fff" size={20} />
            </View>
          </Pressable>

          <Pressable onPress={() => setStep("equipment")}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </Screen>
      </>
    );
  }

  // STEP 3 — review
  const meta = INCIDENT_SEVERITY_META[severity];
  const accent = statusMeta[meta.status].color;
  const TypeIcon = TYPE_ICON[type];

  return (
    <>
      <Stack.Screen options={{ title: "New Incident" }} />
      <Screen>
        <SectionHeader kicker="Step 3 of 3" title="Confirm & Submit" />

        <Card glow gradient={Gradients.cardHi}>
          <View style={styles.reviewHead}>
            <View style={[styles.iconWrap, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <TypeIcon color={accent} size={22} />
            </View>
            <View style={[styles.sevPill, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <View style={[styles.sevDot, { backgroundColor: accent }]} />
              <Text style={[styles.sevText, { color: accent }]}>{meta.label.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.reviewTitle}>{title}</Text>
          <Text style={styles.reviewSummary}>{summary}</Text>
        </Card>

        <Card>
          <SummaryRow label="EQUIPMENT" value={`${equipment?.nickname} · ${equipment?.year} ${equipment?.make}`} />
          <View style={styles.divider} />
          <SummaryRow label="TYPE" value={INCIDENT_TYPE_LABEL[type]} />
          <View style={styles.divider} />
          <SummaryRow label="LOCATION" value={location} />
          <View style={styles.divider} />
          <SummaryRow label="EVIDENCE" value={`${photos} photo${photos !== 1 ? "s" : ""}`} />
        </Card>

        <Pressable onPress={submit}>
          <View style={styles.primary}>
            <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.primaryText}>File Incident Report</Text>
            <Check color="#fff" size={20} />
          </View>
        </Pressable>

        <Pressable onPress={() => setStep("details")}>
          <Text style={styles.backText}>Back to details</Text>
        </Pressable>
      </Screen>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", marginTop: 8 },
  dualBtn: { flexDirection: "row", gap: 8 },
  toggle: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border },
  toggleOn: { backgroundColor: "#1E5BFF", borderColor: "#3D8BFF" },
  toggleText: { color: Colors.textMuted, fontSize: 13, fontWeight: "800" },
  toggleTextOn: { color: "#fff" },
  eqPick: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  eqPickOn: { borderColor: "rgba(94,231,255,0.55)", backgroundColor: "rgba(94,231,255,0.08)" },
  eqName: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  eqSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  iconBubble: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(94,231,255,0.12)" },
  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 16, overflow: "hidden", marginTop: 8 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  backText: { color: Colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 4, fontWeight: "700" },

  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeCell: { width: "31%" },
  typeChip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  typeChipOn: { backgroundColor: "rgba(94,231,255,0.1)", borderColor: "rgba(94,231,255,0.5)" },
  typeText: { color: Colors.textMuted, fontSize: 11.5, fontWeight: "800" },

  sevBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  sevBtnText: { color: Colors.textMuted, fontSize: 12.5, fontWeight: "800" },
  sevDot: { width: 8, height: 8, borderRadius: 99 },

  input: { color: Colors.text, fontSize: 14, padding: 13, marginTop: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  photoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(94,231,255,0.4)", backgroundColor: "rgba(94,231,255,0.08)", marginTop: 12 },
  photoText: { color: Colors.cyan, fontSize: 13, fontWeight: "800" },
  photoBadge: { backgroundColor: Colors.cyan, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  photoBadgeText: { color: Colors.navy, fontSize: 11, fontWeight: "800" },

  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  sevPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  sevText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  reviewTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", marginTop: 14 },
  reviewSummary: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 12 },
  summaryLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  summaryValue: { color: Colors.text, fontSize: 15, fontWeight: "800", marginTop: 4 },
});
