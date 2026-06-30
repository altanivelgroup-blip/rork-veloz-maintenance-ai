import { FileText, Gauge, Hash, IdCard, Weight, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { truckSubtypeMeta, trailerSubtypeMeta, roadReadyMeta, availabilityMeta } from "@/constants/mockData";
import { Colors } from "@/constants/colors";
import type { Truck, Trailer } from "@/constants/mockData";
import HealthGauge from "@/components/HealthGauge";
import RoadReadyBadge from "@/components/RoadReadyBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import InspectionSyncBadge from "@/components/InspectionSyncBadge";
import TruckSilhouette from "@/components/TruckSilhouette";
import TrailerSilhouette from "@/components/TrailerSilhouette";

type Props = {
  visible: boolean;
  asset: Truck | Trailer;
  kind: "truck" | "trailer";
  onClose: () => void;
};

const { height: SCREEN_H } = Dimensions.get("window");

/** Asset Blueprint Sheet — slide-up drawer with full equipment metadata profile. */
export default function AssetBlueprint({ visible, asset, kind, onClose }: Props) {
  const slide = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: visible ? 0 : SCREEN_H,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
    }).start();
  }, [visible, slide]);

  if (!visible) return null;

  const isTruck = kind === "truck";
  const truck = isTruck ? (asset as Truck) : undefined;
  const trailer = !isTruck ? (asset as Trailer) : undefined;
  const subtypeLabel = isTruck
    ? truckSubtypeMeta[truck!.subtype].label
    : trailerSubtypeMeta[trailer!.subtype].label;

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        {/* Handle */}
        <View style={styles.handleBar}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X color={Colors.textMuted} size={20} />
          </Pressable>
          <Text style={styles.sheetTitle}>Asset Blueprint</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Silhouette */}
          <View style={styles.silWrap}>
            {isTruck ? (
              <TruckSilhouette subtype={truck!.subtype} tint={roadReadyMeta[truck!.roadReadyStatus].color} width={280} height={140} />
            ) : (
              <TrailerSilhouette subtype={trailer!.subtype} tint={roadReadyMeta[trailer!.roadReadyStatus].color} width={280} height={120} />
            )}
          </View>

          {/* Identity */}
          <Text style={styles.assetName}>{asset.nickname}</Text>
          <Text style={styles.assetType}>{subtypeLabel}</Text>

          {/* Road-Ready + Availability */}
          <View style={styles.statusRow}>
            <RoadReadyBadge status={asset.roadReadyStatus} />
            <AvailabilityBadge state={asset.availability} />
          </View>

          {/* Inspection sync */}
          <View style={{ marginTop: 6 }}>
            <InspectionSyncBadge lastInspectionAt={asset.lastInspectionAt} lastInspectionResult={asset.lastInspectionResult} />
          </View>

          {/* Health gauge */}
          <View style={styles.healthRow}>
            <HealthGauge value={asset.health} size={90} label="Health" />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionKicker}>RUNTIME PROFILE</Text>
              {isTruck && (
                <>
                  <Text style={styles.metaRow}>Odometer: <Text style={styles.metaVal}>{truck!.mileage.toLocaleString()} mi</Text></Text>
                  <Text style={styles.metaRow}>Fuel: <Text style={styles.metaVal}>{truck!.fuelType} · {truck!.avgMpg.toFixed(1)} MPG</Text></Text>
                </>
              )}
              {!isTruck && (
                <>
                  <Text style={styles.metaRow}>GVWR: <Text style={styles.metaVal}>{(trailer!.gvwr / 1000).toFixed(1)}k lb</Text></Text>
                  <Text style={styles.metaRow}>Capacity: <Text style={styles.metaVal}>{trailer!.carCapacity} car{trailer!.carCapacity > 1 ? "s" : ""}</Text></Text>
                </>
              )}
            </View>
          </View>

          {/* Metadata grid */}
          <Text style={styles.sectionKicker}>REGISTRATION & IDENTITY</Text>
          <View style={styles.metaGrid}>
            <MetaTile icon={<Hash color={Colors.cyan} size={14} />} label="VIN" value={isTruck ? truck!.vin : "—"} />
            <MetaTile icon={<IdCard color={Colors.cyan} size={14} />} label="Plate" value={isTruck ? `${truck!.plate} · ${truck!.state}` : "—"} />
            <MetaTile icon={<FileText color={Colors.cyan} size={14} />} label="Year/Make/Model" value={`${asset.year} ${asset.make} ${asset.model}`} />
            {isTruck ? (
              <>
                <MetaTile icon={<Weight color={Colors.cyan} size={14} />} label="Curb Weight" value={`${truck!.emptyWeight.toLocaleString()} lb`} />
                <MetaTile icon={<Weight color={Colors.cyan} size={14} />} label="GVWR" value={`${truck!.gvwr.toLocaleString()} lb`} />
                <MetaTile icon={<Gauge color={Colors.cyan} size={14} />} label="CDL" value={truck!.cdl} />
              </>
            ) : (
              <>
                <MetaTile icon={<Weight color={Colors.cyan} size={14} />} label="Empty Weight" value={`${trailer!.emptyWeight.toLocaleString()} lb`} />
                <MetaTile icon={<Weight color={Colors.cyan} size={14} />} label="GVWR" value={`${trailer!.gvwr.toLocaleString()} lb`} />
                <MetaTile icon={<Gauge color={Colors.cyan} size={14} />} label="Deck" value={trailerSubtypeMeta[trailer!.subtype].deckLabel} />
              </>
            )}
          </View>

          {/* Availability detail */}
          <Text style={styles.sectionKicker}>DISPATCH STATUS</Text>
          <View style={styles.availDetail}>
            <View style={[styles.availDot, { backgroundColor: availabilityMeta[asset.availability].color }]} />
            <Text style={styles.availLabel}>{availabilityMeta[asset.availability].label}</Text>
          </View>
          {asset.availability === "assigned" && (
            <Text style={styles.availSub}>
              Currently coupled to {isTruck ? (truck!.assignedTrailerId ? `Trailer ${truck!.assignedTrailerId}` : "unknown") : (trailer!.assignedTruckId ? `Truck ${trailer!.assignedTruckId}` : "unknown")}
            </Text>
          )}
{asset.availability === "in_shop" && (
            <Text style={styles.availSub}>Vehicle is at maintenance facility. Do not dispatch.</Text>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function MetaTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metaTile}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        {icon}
        <Text style={styles.metaTileLabel}>{label}</Text>
      </View>
      <Text style={styles.metaTileValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end", zIndex: 100 },
  sheet: {
    backgroundColor: Colors.navy2,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SCREEN_H * 0.82, paddingBottom: 40,
    borderWidth: 1, borderColor: Colors.borderHi, borderBottomWidth: 0,
  },
  handleBar: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.textDim },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)" },
  sheetTitle: { color: Colors.text, fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 20 },
  silWrap: { alignItems: "center", marginTop: 4, marginBottom: 8 },
  assetName: { color: Colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.4, textAlign: "center" },
  assetType: { color: Colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 2, marginBottom: 12 },
  statusRow: { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 8 },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12, marginBottom: 16, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  sectionKicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.6, fontWeight: "800", marginBottom: 10, marginTop: 8 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  metaTile: {
    flexBasis: "47%", flexGrow: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  metaTileLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  metaTileValue: { color: Colors.text, fontSize: 12, fontWeight: "700", marginTop: 4 },
  metaRow: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  metaVal: { color: Colors.text, fontWeight: "700" },
  availDetail: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border },
  availDot: { width: 10, height: 10, borderRadius: 99 },
  availLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  availSub: { color: Colors.textMuted, fontSize: 12, marginTop: 6, marginLeft: 18 },
});
