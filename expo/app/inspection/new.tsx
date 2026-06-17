import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Camera, Check, ChevronRight, Container, ShieldCheck, Truck, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

type Kind = "truck" | "trailer";
type Trip = "pre-trip" | "post-trip";

const TRUCK_ITEMS = [
  { id: "tires", label: "Tires", desc: "Pressure, tread, condition" },
  { id: "lights", label: "Lights", desc: "Headlights, signals, brake" },
  { id: "brakes", label: "Brakes", desc: "Pedal feel, fluid level" },
  { id: "mirrors", label: "Mirrors", desc: "Side & rear-view adjustment" },
  { id: "leaks", label: "Leaks", desc: "Oil, coolant, transmission" },
  { id: "windshield", label: "Windshield", desc: "Cracks, wipers, fluid" },
];

const TRAILER_ITEMS = [
  { id: "straps", label: "Straps", desc: "Tie-downs, ratchets" },
  { id: "bearings", label: "Bearings", desc: "Hub temperature check" },
  { id: "ramps", label: "Ramps", desc: "Operational & locked" },
  { id: "brakes", label: "Brakes", desc: "Trailer brake controller" },
  { id: "tires", label: "Tires", desc: "Tread & pressure" },
  { id: "winch", label: "Winch", desc: "Cable, drum, remote" },
  { id: "lights", label: "Lights", desc: "Brake, marker, signals" },
];

export default function NewInspectionScreen() {
  const { trucks, trailers, addInspection } = useFleet();
  const [kind, setKind] = useState<Kind>("truck");
  const [trip, setTrip] = useState<Trip>("pre-trip");
  const [eqId, setEqId] = useState<string | null>(null);
  const [step, setStep] = useState<"setup" | "checks" | "review">("setup");
  const [checks, setChecks] = useState<Record<string, { ok: boolean | null; note?: string }>>({});
  const [photos, setPhotos] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const items = kind === "truck" ? TRUCK_ITEMS : TRAILER_ITEMS;
  const list = kind === "truck" ? trucks : trailers;

  const progress = useMemo(() => {
    const filled = items.filter((it) => checks[it.id]?.ok !== null && checks[it.id]?.ok !== undefined).length;
    return filled / items.length;
  }, [items, checks]);

  function hap() {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
  }

  function setCheck(id: string, ok: boolean) {
    hap();
    setChecks((c) => ({ ...c, [id]: { ok, note: c[id]?.note } }));
  }

  function setNote(id: string, note: string) {
    setChecks((c) => ({ ...c, [id]: { ok: c[id]?.ok ?? null, note } }));
  }

  function submit() {
    if (!eqId) return;
    const evaluated = items.map((it) => ({
      id: it.id,
      label: it.label,
      ok: checks[it.id]?.ok ?? true,
      note: checks[it.id]?.note,
    }));
    const failed = evaluated.filter((it) => !it.ok).length;
    const result: "pass" | "fail" | "flagged" = failed === 0 ? "pass" : failed > 1 ? "fail" : "flagged";
    const equipment = list.find((e) => e.id === eqId);
    addInspection({
      id: `ins-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: trip,
      equipmentKind: kind,
      equipmentId: eqId,
      mileage: kind === "truck" ? (equipment as any)?.mileage : undefined,
      driver: "You",
      result,
      items: evaluated,
      notes: notes || undefined,
      photos,
    });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace("/(tabs)/inspections");
  }

  if (step === "setup") {
    return (
      <Screen>
        <SectionHeader kicker="Step 1 of 3" title="What are you inspecting?" />

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

        <Text style={styles.label}>TRIP TYPE</Text>
        <View style={styles.dualBtn}>
          <Pressable style={[styles.toggle, trip === "pre-trip" && styles.toggleOn]} onPress={() => { setTrip("pre-trip"); hap(); }}>
            <Text style={[styles.toggleText, trip === "pre-trip" && styles.toggleTextOn]}>Pre-Trip</Text>
          </Pressable>
          <Pressable style={[styles.toggle, trip === "post-trip" && styles.toggleOn]} onPress={() => { setTrip("post-trip"); hap(); }}>
            <Text style={[styles.toggleText, trip === "post-trip" && styles.toggleTextOn]}>Post-Trip</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>SELECT {kind === "truck" ? "TRUCK" : "TRAILER"}</Text>
        <View style={{ gap: 8 }}>
          {list.map((eq) => (
            <Pressable key={eq.id} onPress={() => { setEqId(eq.id); hap(); }}>
              <View style={[styles.eqPick, eqId === eq.id && styles.eqPickOn]}>
                <View style={[styles.iconBubble, { backgroundColor: "rgba(94,231,255,0.12)" }]}>
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

        <Pressable disabled={!eqId} onPress={() => { setStep("checks"); hap(); }}>
          <View style={[styles.primary, !eqId && { opacity: 0.4 }]}>
            <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.primaryText}>Begin Inspection</Text>
            <ChevronRight color="#fff" size={20} />
          </View>
        </Pressable>
      </Screen>
    );
  }

  if (step === "checks") {
    return (
      <Screen>
        <SectionHeader kicker="Step 2 of 3" title="Inspection Checklist" />
        <View style={styles.progressTrack}>
          <LinearGradient colors={["#5EE7FF", "#3D8BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}% complete</Text>

        <View style={{ gap: 10 }}>
          {items.map((it) => {
            const c = checks[it.id];
            const ok = c?.ok;
            return (
              <Card key={it.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{it.label}</Text>
                    <Text style={styles.itemDesc}>{it.desc}</Text>
                  </View>
                  <Pressable style={[styles.checkBtn, ok === true && styles.checkOk]} onPress={() => setCheck(it.id, true)}>
                    <Check color={ok === true ? "#fff" : Colors.green} size={18} />
                  </Pressable>
                  <Pressable style={[styles.checkBtn, ok === false && styles.checkFail]} onPress={() => setCheck(it.id, false)}>
                    <X color={ok === false ? "#fff" : Colors.red} size={18} />
                  </Pressable>
                </View>
                {ok === false && (
                  <TextInput
                    placeholder="Describe the issue..."
                    placeholderTextColor={Colors.textDim}
                    value={c?.note ?? ""}
                    onChangeText={(t) => setNote(it.id, t)}
                    style={styles.noteInput}
                    multiline
                  />
                )}
              </Card>
            );
          })}
        </View>

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

        <Text style={styles.label}>DRIVER NOTES</Text>
        <TextInput
          placeholder="Add any context, location, or observations..."
          placeholderTextColor={Colors.textDim}
          value={notes}
          onChangeText={setNotes}
          style={[styles.noteInput, { minHeight: 80 }]}
          multiline
        />

        <Pressable onPress={() => setStep("review")} disabled={progress < 1}>
          <View style={[styles.primary, progress < 1 && { opacity: 0.4 }]}>
            <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.primaryText}>Review & Submit</Text>
            <ChevronRight color="#fff" size={20} />
          </View>
        </Pressable>
      </Screen>
    );
  }

  // review
  const failed = items.filter((it) => checks[it.id]?.ok === false);
  const passed = items.length - failed.length;
  const status: "pass" | "fail" | "flagged" = failed.length === 0 ? "pass" : failed.length > 1 ? "fail" : "flagged";
  const accent = status === "pass" ? Colors.green : status === "fail" ? Colors.red : Colors.amber;
  const equipment = list.find((e) => e.id === eqId);

  return (
    <Screen>
      <SectionHeader kicker="Step 3 of 3" title="Review & Submit" />

      <Card glow>
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <View style={[styles.bigBadge, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
            {status === "pass" ? <ShieldCheck color={accent} size={36} /> : <X color={accent} size={36} />}
          </View>
          <Text style={[styles.bigResult, { color: accent }]}>{status.toUpperCase()}</Text>
          <Text style={styles.sub}>{passed}/{items.length} checks passed · {photos} photos</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.summaryLabel}>EQUIPMENT</Text>
        <Text style={styles.summaryValue}>{equipment?.nickname}</Text>
        <Text style={styles.sub}>{equipment?.year} {equipment?.make} {equipment?.model}</Text>
        <View style={styles.divider} />
        <Text style={styles.summaryLabel}>INSPECTION</Text>
        <Text style={styles.summaryValue}>{trip === "pre-trip" ? "Pre-Trip" : "Post-Trip"} · {new Date().toLocaleDateString()}</Text>
        {failed.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.summaryLabel}>FLAGGED ITEMS</Text>
            <View style={{ gap: 8, marginTop: 6 }}>
              {failed.map((f) => (
                <View key={f.id} style={styles.flagRow}>
                  <View style={[styles.dot, { backgroundColor: Colors.red }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.flagName}>{f.label}</Text>
                    {checks[f.id]?.note ? <Text style={styles.sub}>{checks[f.id]?.note}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>

      <Pressable onPress={submit}>
        <View style={styles.primary}>
          <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.primaryText}>Submit Inspection</Text>
          <Check color="#fff" size={20} />
        </View>
      </Pressable>

      <Pressable onPress={() => setStep("checks")}>
        <Text style={styles.backText}>Back to checklist</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", marginTop: 8 },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  dualBtn: { flexDirection: "row", gap: 8 },
  toggle: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border },
  toggleOn: { backgroundColor: "#1E5BFF", borderColor: "#3D8BFF" },
  toggleText: { color: Colors.textMuted, fontSize: 13, fontWeight: "800" },
  toggleTextOn: { color: "#fff" },
  eqPick: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  eqPickOn: { borderColor: "rgba(94,231,255,0.55)", backgroundColor: "rgba(94,231,255,0.08)" },
  eqName: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  eqSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  iconBubble: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 16, overflow: "hidden", marginTop: 8 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  progressText: { color: Colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  itemTitle: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  itemDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  checkBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, backgroundColor: "rgba(255,255,255,0.03)" },
  checkOk: { backgroundColor: Colors.green, borderColor: Colors.green },
  checkFail: { backgroundColor: Colors.red, borderColor: Colors.red },
  noteInput: { color: Colors.text, fontSize: 13, padding: 12, marginTop: 10, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border, minHeight: 50 },
  photoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(94,231,255,0.4)", backgroundColor: "rgba(94,231,255,0.08)" },
  photoText: { color: Colors.cyan, fontSize: 13, fontWeight: "800" },
  photoBadge: { backgroundColor: Colors.cyan, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  photoBadgeText: { color: Colors.navy, fontSize: 11, fontWeight: "800" },
  bigBadge: { width: 76, height: 76, borderRadius: 76, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  bigResult: { fontSize: 28, fontWeight: "800", letterSpacing: 2, marginTop: 8 },
  summaryLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  summaryValue: { color: Colors.text, fontSize: 17, fontWeight: "800", marginTop: 4 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 12 },
  flagRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 99, marginTop: 6 },
  flagName: { color: Colors.text, fontSize: 13, fontWeight: "700" },
  backText: { color: Colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 4, fontWeight: "700" },
});
