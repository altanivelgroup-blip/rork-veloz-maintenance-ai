import { Clock, Eye, ShieldCheck, ShieldAlert, TriangleAlert, Camera, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { InspectionVaultEntry } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";

type Props = {
  truckId?: string;
  trailerId?: string;
};

/**
 * Inspection Vault — 30-day paired inspection history panel.
 * Click any active truck-trailer pair to view its full pre-trip
 * checklist history, quad-capture photos, and time-on-task velocity.
 */
export default function InspectionVault({ truckId, trailerId }: Props) {
  const { getInspectionVault, trucks, trailers } = useFleet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const entries = useMemo(() => {
    let list = getInspectionVault(truckId, trailerId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.truckName.toLowerCase().includes(q) ||
          e.trailerName?.toLowerCase().includes(q) ||
          e.driver.toLowerCase().includes(q),
      );
    }
    return list;
  }, [getInspectionVault, truckId, trailerId, search]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries],
  );

  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;

  return (
    <View style={{ gap: 10 }}>
      <SectionHeader kicker="Inspection Vault" title={`30-Day Inspection History${entries.length > 0 ? ` (${entries.length})` : ""}`} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search color={Colors.textDim} size={14} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by truck, trailer, or driver..."
          placeholderTextColor={Colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {sortedEntries.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No inspection records in the last 30 days.</Text>
        </Card>
      ) : (
        <View style={{ gap: 6 }}>
          {sortedEntries.map((entry) => {
            const isExpanded = selected?.id === entry.id;
            const truckFail = entry.truckResult === "fail" || entry.truckResult === "expired";
            const trailerFail = entry.trailerResult === "fail" || entry.trailerResult === "expired";
            const hasIssue = truckFail || trailerFail;

            return (
              <Pressable key={entry.id} onPress={() => setSelectedId(isExpanded ? null : entry.id)}>
                <View style={[styles.entry, hasIssue && styles.entryFail]}>
                  {/* Summary row */}
                  <View style={styles.summaryRow}>
                    <View style={[styles.iconWrap, { backgroundColor: hasIssue ? "rgba(255,84,112,0.14)" : "rgba(34,211,153,0.1)" }]}>
                      {hasIssue ? <ShieldAlert color={Colors.red} size={16} /> : <ShieldCheck color={Colors.green} size={16} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryTitle}>
                        {entry.truckName}{entry.trailerName ? ` + ${entry.trailerName}` : " (Bobtail)"}
                      </Text>
                      <Text style={styles.entryMeta}>
                        {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {entry.driver}
                      </Text>
                    </View>
                    <View style={styles.badgeRow}>
                      <ResultBadge result={entry.truckResult} label="Truck" />
                      {entry.trailerResult && <ResultBadge result={entry.trailerResult} label="Trailer" />}
                    </View>
                    <Eye color={isExpanded ? Colors.cyan : Colors.textDim} size={14} />
                  </View>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <View style={styles.expand}>
                      <View style={styles.expandDivider} />
                      <View style={styles.detailGrid}>
                        <DetailItem icon={<Camera color={Colors.textMuted} size={12} />} label="Photos" value={`${entry.photos}`} />
                        <DetailItem icon={<Clock color={Colors.textMuted} size={12} />} label="Time on task" value={`${Math.floor(entry.timeOnTaskSeconds / 60)}m ${entry.timeOnTaskSeconds % 60}s`} />
                        {entry.cargoSealVerified && entry.cargoSealId ? (
                          <DetailItem icon={<ShieldCheck color={Colors.green} size={12} />} label="Cargo Seal" value={entry.cargoSealId} color={Colors.green} />
                        ) : (
                          <DetailItem icon={<TriangleAlert color={Colors.amber} size={12} />} label="Cargo Seal" value="Not verified" color={Colors.amber} />
                        )}
                      </View>
                      {entry.notes && (
                        <Text style={styles.notes}>{entry.notes}</Text>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ResultBadge({ result, label }: { result: "pass" | "fail" | "flagged" | "expired"; label: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    pass: { color: Colors.green, bg: "rgba(34,211,153,0.12)" },
    fail: { color: Colors.red, bg: "rgba(255,84,112,0.14)" },
    flagged: { color: Colors.amber, bg: "rgba(255,181,71,0.12)" },
    expired: { color: Colors.red, bg: "rgba(255,84,112,0.14)" },
  };
  const c = config[result] ?? config.pass;
  return (
    <View style={[styles.resultBadge, { backgroundColor: c.bg, borderColor: `${c.color}40` }]}>
      <Text style={[styles.resultLabel, { color: c.color }]}>{label}: {result.toUpperCase()}</Text>
    </View>
  );
}

function DetailItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <View style={styles.detailItem}>
      {icon}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  entry: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryFail: {
    borderColor: "rgba(255,84,112,0.25)",
    backgroundColor: "rgba(255,84,112,0.04)",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  entryTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  entryMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 4,
  },
  resultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  expand: {
    marginTop: 10,
  },
  expandDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
  },
  detailValue: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  notes: {
    color: Colors.textDim,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 16,
  },
});
