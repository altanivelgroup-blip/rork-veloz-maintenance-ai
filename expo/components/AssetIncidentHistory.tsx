import { AlertTriangle, ChevronRight, Clock, Wrench, Package, ShieldAlert, ArrowRight } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { operationalSeverityMeta, operationalResolutionMeta } from "@/constants/mockData";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import { useFleet } from "@/providers/FleetProvider";

type Props = {
  assetId: string;
  assetName: string;
};

/**
 * Asset Incident History widget — displayed on truck and trailer detail pages.
 * Shows all historical breakdowns, damage claims, and operational incidents
 * associated with a specific equipment ID over its operational lifespan.
 */
export default function AssetIncidentHistory({ assetId, assetName }: Props) {
  const { getAssetIncidentHistory } = useFleet();
  const history = useMemo(() => getAssetIncidentHistory(assetId), [getAssetIncidentHistory, assetId]);

  if (history.length === 0) return null;

  return (
    <>
      <SectionHeader kicker="Safety Ledger" title={`Incident History (${history.length})`} />
      <View style={{ gap: 6 }}>
        {history.map((incident, idx) => {
          const sevMeta = operationalSeverityMeta[incident.severityTier];
          const resMeta = operationalResolutionMeta[incident.resolutionStatus];
          const isCritical = incident.severityTier === "critical_sos";

          return (
            <Card key={incident.incidentId}>
              <View style={[styles.row, isCritical && { borderLeftWidth: 3, borderLeftColor: sevMeta.color, paddingLeft: 9 }]}>
                <View style={[styles.iconWrap, { backgroundColor: sevMeta.soft }]}>
                  {incident.severityTier === "critical_sos" ? (
                    <ShieldAlert color={sevMeta.color} size={14} />
                  ) : incident.severityTier === "mechanical_failure" ? (
                    <Wrench color={sevMeta.color} size={14} />
                  ) : incident.severityTier === "cargo_damage_claim" ? (
                    <Package color={sevMeta.color} size={14} />
                  ) : (
                    <Clock color={sevMeta.color} size={14} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{incident.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.sevChip, { backgroundColor: sevMeta.soft }]}>
                      <Text style={[styles.sevText, { color: sevMeta.color }]}>{sevMeta.label}</Text>
                    </View>
                    <View style={[styles.resChip, { backgroundColor: `${resMeta.color}18` }]}>
                      <Text style={[styles.resText, { color: resMeta.color }]}>{resMeta.label}</Text>
                    </View>
                    <Text style={styles.date}>
                      {new Date(incident.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <Text style={styles.desc} numberOfLines={2}>{incident.description}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sevChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sevText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  resChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  date: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: "auto",
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
