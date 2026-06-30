import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, MapPin, Clock, MessageSquare, ShieldAlert, Wrench, Package, ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { operationalSeverityMeta, operationalResolutionMeta, type OperationalIncident } from "@/constants/mockData";

type Props = {
  incidents: OperationalIncident[];
};

/**
 * Operational Triage Queue — prioritized feed of open incidents.
 * Gold-priority Critical SOS events render at the top with crimson
 * flashing alerts. Secondary sort: mechanical, cargo claims, then low/delay.
 * Expanding an item shows dispatcher notes, affected cargo VINs, and document refs.
 */
export default function OperationalTriageQueue({ incidents }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (incidents.length === 0) {
    return (
      <View style={styles.empty}>
        <ShieldAlert color={Colors.green} size={28} />
        <Text style={styles.emptyTitle}>All Clear</Text>
        <Text style={styles.emptySub}>No open operational incidents.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {incidents.map((incident) => {
        const sevMeta = operationalSeverityMeta[incident.severityTier];
        const resMeta = operationalResolutionMeta[incident.resolutionStatus];
        const isExpanded = expandedId === incident.incidentId;
        const isCritical = incident.severityTier === "critical_sos";

        return (
          <Pressable
            key={incident.incidentId}
            onPress={() => setExpandedId(isExpanded ? null : incident.incidentId)}
          >
            <View style={[styles.card, isCritical && styles.cardCritical]}>
              {isCritical && (
                <LinearGradient
                  colors={["rgba(255,51,102,0.15)", "rgba(255,51,102,0.02)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}

              {/* Priority header */}
              <View style={styles.priorityRow}>
                <View style={[styles.severityBadge, { backgroundColor: sevMeta.soft, borderColor: `${sevMeta.color}50` }]}>
                  {isCritical && <View style={styles.pulseDot} />}
                  <AlertTriangle color={sevMeta.color} size={11} style={{ marginLeft: isCritical ? 2 : 0 }} />
                  <Text style={[styles.severityLabel, { color: sevMeta.color }]}>{sevMeta.label}</Text>
                </View>
                <View style={[styles.resolutionBadge, { backgroundColor: `${resMeta.color}18`, borderColor: `${resMeta.color}40` }]}>
                  <Text style={[styles.resolutionLabel, { color: resMeta.color }]}>{resMeta.label}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(incident.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>

              {/* Title */}
              <Text style={[styles.title, isCritical && { color: "#FF3366" }]}>{incident.title}</Text>
              <Text style={styles.desc} numberOfLines={isExpanded ? undefined : 2}>{incident.description}</Text>

              {/* Equipment context */}
              {incident.truckName && (
                <View style={styles.contextRow}>
                  {incident.truckName && <Text style={styles.contextItem}>🚛 {incident.truckName}</Text>}
                  {incident.trailerName && <Text style={styles.contextItem}>🔗 {incident.trailerName}</Text>}
                  {incident.operatorName && <Text style={styles.contextItem}>👤 {incident.operatorName}</Text>}
                </View>
              )}

              {/* Location */}
              {incident.gpsLocation && (
                <View style={styles.locationRow}>
                  <MapPin color={Colors.textDim} size={11} />
                  <Text style={styles.locationText}>{incident.gpsLocation}</Text>
                </View>
              )}

              {/* Expanded detail drawer */}
              {isExpanded && (
                <View style={styles.expand}>
                  <View style={styles.divider} />

                  {/* Affected Cargo VINs */}
                  {incident.affectedCargoVins.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Affected Cargo VINs</Text>
                      <View style={styles.vinList}>
                        {incident.affectedCargoVins.map((vin, i) => (
                          <View key={i} style={styles.vinChip}>
                            <Package color={Colors.textDim} size={10} />
                            <Text style={styles.vinText}>{vin}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Document Refs */}
                  {incident.documentRefs.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Documents</Text>
                      <View style={{ gap: 4 }}>
                        {incident.documentRefs.map((doc, i) => {
                          const Icon = doc.type === "police_report" ? ShieldAlert : doc.type === "insurance_claim" ? ShieldAlert : doc.type === "photo" ? null : null;
                          const label = doc.type === "police_report" ? "Police Report" : doc.type === "insurance_claim" ? "Insurance Claim" : doc.type === "photo" ? "Photo" : "Document";
                          return (
                            <View key={i} style={styles.docRow}>
                              {Icon && <Icon color={Colors.textDim} size={12} />}
                              <Text style={styles.docLabel}>{label}:</Text>
                              <Text style={styles.docRef}>{doc.ref}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Dispatcher Notes */}
                  {incident.dispatcherNotes.length > 0 && (
                    <View style={styles.section}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
                        <MessageSquare color={Colors.cyan} size={12} />
                        <Text style={styles.sectionLabel}>Dispatcher Notes</Text>
                      </View>
                      <View style={{ gap: 6 }}>
                        {incident.dispatcherNotes.map((note, i) => (
                          <View key={i} style={styles.noteItem}>
                            <View style={styles.noteHeader}>
                              <Text style={styles.noteBy}>{note.by}</Text>
                              <Text style={styles.noteAt}>
                                {new Date(note.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </Text>
                            </View>
                            <Text style={styles.noteText}>{note.text}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Corrective Action / Resolution */}
                  {incident.correctiveAction && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Corrective Action</Text>
                      <Text style={styles.correctiveText}>{incident.correctiveAction}</Text>
                    </View>
                  )}
                  {incident.resolvedBy && (
                    <Text style={styles.resolvedMeta}>
                      Resolved by {incident.resolvedBy} on {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString() : "—"}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 14,
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCritical: {
    borderColor: "rgba(255,51,102,0.4)",
    borderWidth: 1.5,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#FF3366",
  },
  severityLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  resolutionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  resolutionLabel: {
    fontSize: 9,
    fontWeight: "800",
  },
  timestamp: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: "auto",
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  contextRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  contextItem: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
  },
  expand: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  vinList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  vinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vinText: {
    color: Colors.textMuted,
    fontSize: 10.5,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  docLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "700",
  },
  docRef: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  noteItem: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  noteBy: {
    color: Colors.cyan,
    fontSize: 11,
    fontWeight: "800",
  },
  noteAt: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
  },
  noteText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  correctiveText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic",
  },
  resolvedMeta: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
});
