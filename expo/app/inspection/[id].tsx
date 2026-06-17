import { Stack, useLocalSearchParams } from "expo-router";
import { Camera, Check, ClipboardList, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors } from "@/constants/colors";
import { useFleet } from "@/providers/FleetProvider";

export default function InspectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inspections, trucks, trailers } = useFleet();
  const insp = inspections.find((i) => i.id === id);
  if (!insp) return <Screen><Text style={{ color: Colors.text }}>Inspection not found</Text></Screen>;

  const eq = insp.equipmentKind === "truck"
    ? trucks.find((t) => t.id === insp.equipmentId)
    : trailers.find((t) => t.id === insp.equipmentId);

  const accent = insp.result === "pass" ? Colors.green : insp.result === "fail" ? Colors.red : Colors.amber;
  const ok = insp.items.filter((i) => i.ok).length;

  return (
    <>
      <Stack.Screen options={{ title: "Inspection" }} />
      <Screen>
        <Card glow>
          <View style={{ alignItems: "center" }}>
            <View style={[styles.badge, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
              {insp.result === "pass" ? <Check color={accent} size={28} /> : <X color={accent} size={28} />}
            </View>
            <Text style={[styles.result, { color: accent }]}>{insp.result.toUpperCase()}</Text>
            <Text style={styles.sub}>{ok}/{insp.items.length} checks passed</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.kicker}>EQUIPMENT</Text>
          <Text style={styles.title}>{eq?.nickname}</Text>
          <Text style={styles.sub}>{eq?.year} {eq?.make} {eq?.model}</Text>
          <View style={styles.divider} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View>
              <Text style={styles.kicker}>TYPE</Text>
              <Text style={styles.value}>{insp.type === "pre-trip" ? "Pre-Trip" : "Post-Trip"}</Text>
            </View>
            <View>
              <Text style={styles.kicker}>DATE</Text>
              <Text style={styles.value}>{insp.date}</Text>
            </View>
            <View>
              <Text style={styles.kicker}>DRIVER</Text>
              <Text style={styles.value}>{insp.driver}</Text>
            </View>
          </View>
        </Card>

        <SectionHeader kicker="Detail" title="Check Results" />
        <Card>
          {insp.items.map((it, idx) => (
            <View key={it.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
                <View style={[styles.iconBubble, { backgroundColor: it.ok ? "rgba(34,211,153,0.18)" : "rgba(255,84,112,0.18)" }]}>
                  {it.ok ? <Check color={Colors.green} size={16} /> : <X color={Colors.red} size={16} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{it.label}</Text>
                  {it.note && <Text style={styles.note}>{it.note}</Text>}
                </View>
              </View>
              {idx < insp.items.length - 1 && <View style={styles.thinDivider} />}
            </View>
          ))}
        </Card>

        {insp.notes && (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ClipboardList color={Colors.cyan} size={16} />
              <Text style={styles.kicker}>DRIVER NOTES</Text>
            </View>
            <Text style={styles.value}>{insp.notes}</Text>
          </Card>
        )}

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Camera color={Colors.cyan} size={16} />
            <Text style={styles.kicker}>EVIDENCE</Text>
          </View>
          <Text style={styles.value}>{insp.photos} photo{insp.photos !== 1 ? "s" : ""} attached</Text>
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  badge: { width: 72, height: 72, borderRadius: 72, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  result: { fontSize: 24, fontWeight: "800", letterSpacing: 1.6, marginTop: 8 },
  kicker: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: Colors.text, fontSize: 20, fontWeight: "800", marginTop: 4 },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  value: { color: Colors.text, fontSize: 14, fontWeight: "700", marginTop: 4 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 12 },
  thinDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  note: { color: Colors.amber, fontSize: 12, marginTop: 3, fontStyle: "italic" },
});
