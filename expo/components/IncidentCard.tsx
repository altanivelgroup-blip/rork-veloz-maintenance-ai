import {
  AlertOctagon,
  AlertTriangle,
  BatteryWarning,
  Camera,
  CarFront,
  ChevronRight,
  CircleDot,
  Container,
  Disc3,
  MapPin,
  ShieldAlert,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "@/components/Card";
import { Colors, statusMeta } from "@/constants/colors";
import {
  INCIDENT_SEVERITY_META,
  INCIDENT_STATUS_META,
  INCIDENT_TYPE_LABEL,
  type Incident,
} from "@/constants/incidentData";

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

export default function IncidentCard({
  incident,
  onPress,
}: {
  incident: Incident;
  onPress?: () => void;
}) {
  const sev = INCIDENT_SEVERITY_META[incident.severity];
  const accent = statusMeta[sev.status].color;
  const Icon = TYPE_ICON[incident.type];
  const EqIcon = incident.equipmentKind === "truck" ? Truck : Container;
  const resolved = incident.status === "resolved";

  return (
    <Card onPress={onPress} style={resolved ? styles.resolved : undefined}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
          <Icon color={accent} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{incident.code}</Text>
            <View style={[styles.sevPill, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <View style={[styles.sevDot, { backgroundColor: accent }]} />
              <Text style={[styles.sevText, { color: accent }]}>{sev.label.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {incident.title}
          </Text>
        </View>
      </View>

      <Text style={styles.summary} numberOfLines={2}>
        {incident.summary}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <EqIcon color={Colors.electric} size={13} />
          <Text style={styles.metaText}>{incident.equipmentName}</Text>
        </View>
        <View style={styles.metaItem}>
          <MapPin color={Colors.textMuted} size={13} />
          <Text style={styles.metaText} numberOfLines={1}>
            {incident.location}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footLeft}>
          <View style={[styles.statusChip, statusChipStyle(incident.status)]}>
            <Text style={[styles.statusText, { color: statusChipColor(incident.status) }]}>
              {INCIDENT_STATUS_META[incident.status].label}
            </Text>
          </View>
          <Text style={styles.tag}>{INCIDENT_TYPE_LABEL[incident.type]}</Text>
        </View>
        <View style={styles.footRight}>
          {incident.photos > 0 && (
            <View style={styles.photoChip}>
              <Camera color={Colors.textMuted} size={12} />
              <Text style={styles.photoText}>{incident.photos}</Text>
            </View>
          )}
          <Text style={styles.date}>{incident.reportedAt}</Text>
          <ChevronRight color={Colors.textDim} size={16} />
        </View>
      </View>
    </Card>
  );
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
  resolved: { opacity: 0.72 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  code: { color: Colors.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  sevPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  sevDot: { width: 6, height: 6, borderRadius: 99 },
  sevText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  title: { color: Colors.text, fontSize: 15, fontWeight: "800", letterSpacing: -0.2, marginTop: 3 },
  summary: { color: Colors.textMuted, fontSize: 12.5, lineHeight: 18, marginTop: 10 },
  metaRow: { flexDirection: "row", gap: 14, marginTop: 12, alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  metaText: { color: Colors.textMuted, fontSize: 11.5, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  tag: { color: Colors.textDim, fontSize: 11, fontWeight: "700" },
  footRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  photoChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  photoText: { color: Colors.textMuted, fontSize: 11, fontWeight: "700" },
  date: { color: Colors.textDim, fontSize: 11, fontWeight: "600" },
});
