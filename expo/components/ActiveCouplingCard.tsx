import { LinearGradient } from "expo-linear-gradient";
import { Link as LinkIcon, Truck, Container, User, Car, ArrowRight, ShieldCheck } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { ActiveCoupling } from "@/constants/mockData";

type Props = { coupling: ActiveCoupling };

/**
 * Active Coupling Card — unified [Truck] 🔗 [Trailer] visual block.
 * Shows bobtail state, cargo seal, operator, and cargo count.
 * Tapping the truck or trailer navigates to that asset's detail page.
 */
export default function ActiveCouplingCard({ coupling }: Props) {
  const isBobtail = coupling.state === "bobtail";
  const hasSeal = !!coupling.cargoSealId;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={isBobtail ? ["rgba(255,181,71,0.06)", "rgba(255,181,71,0.02)"] : ["rgba(94,231,255,0.06)", "rgba(61,139,255,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.border, { borderColor: isBobtail ? "rgba(255,181,71,0.2)" : "rgba(94,231,255,0.15)" }]} pointerEvents="none" />

      {/* Header: coupling ID + state badge */}
      <View style={styles.header}>
        <Text style={styles.couplingId}>{coupling.couplingId.toUpperCase()}</Text>
        <View style={[styles.stateBadge, { backgroundColor: isBobtail ? "rgba(255,181,71,0.14)" : "rgba(94,231,255,0.12)", borderColor: isBobtail ? "rgba(255,181,71,0.4)" : "rgba(94,231,255,0.35)" }]}>
          <Text style={[styles.stateText, { color: isBobtail ? Colors.amber : Colors.cyan }]}>
            {isBobtail ? "BOBTAIL" : "COUPLED"}
          </Text>
        </View>
        {hasSeal && (
          <View style={styles.sealBadge}>
            <ShieldCheck color={Colors.green} size={10} />
            <Text style={styles.sealText}>{coupling.cargoSealId}</Text>
          </View>
        )}
      </View>

      {/* Main chain: Truck 🔗 Trailer (or Truck 🚫 if bobtail) */}
      <View style={styles.chain}>
        <Pressable onPress={() => router.push(`/truck/${coupling.truckId}`)} style={styles.chainNode}>
          <View style={[styles.nodeIcon, { backgroundColor: "rgba(124,196,255,0.15)" }]}>
            <Truck color={Colors.electric} size={18} />
          </View>
          <Text style={styles.nodeLabel}>{coupling.truckName}</Text>
          <Text style={styles.nodeSub}>Truck</Text>
        </Pressable>

        {isBobtail ? (
          <View style={styles.bobtailSeparator}>
            <View style={styles.bobtailLine} />
            <View style={[styles.bobtailBadge]}>
              <Text style={styles.bobtailText}>BOBTAIL</Text>
            </View>
            <View style={styles.bobtailLine} />
          </View>
        ) : (
          <>
            <ChainArrow />
            <Pressable onPress={() => coupling.trailerId && router.push(`/trailer/${coupling.trailerId}`)} style={styles.chainNode}>
              <View style={[styles.nodeIcon, { backgroundColor: "rgba(94,231,255,0.15)" }]}>
                <Container color={Colors.cyan} size={18} />
              </View>
              <Text style={styles.nodeLabel}>{coupling.trailerName}</Text>
              <Text style={styles.nodeSub}>Trailer</Text>
            </Pressable>
          </>
        )}

        {coupling.operatorName && (
          <>
            <ChainArrow />
            <View style={styles.chainNode}>
              <View style={[styles.nodeIcon, { backgroundColor: "rgba(34,211,153,0.12)" }]}>
                <User color={Colors.green} size={16} />
              </View>
              <Text style={styles.nodeLabel}>{coupling.operatorName}</Text>
              <Text style={styles.nodeSub}>Operator</Text>
            </View>
          </>
        )}

        {coupling.cargoCount > 0 && (
          <>
            <ChainArrow />
            <View style={styles.chainNode}>
              <View style={[styles.nodeIcon, { backgroundColor: coupling.state === "coupled" ? "rgba(34,211,153,0.12)" : "rgba(255,255,255,0.06)" }]}>
                <Car color={coupling.state === "coupled" ? Colors.green : Colors.textDim} size={16} />
              </View>
              <Text style={[styles.nodeLabel, { color: coupling.state === "coupled" ? Colors.green : Colors.textDim }]}>
                {coupling.cargoCount} vehicle{coupling.cargoCount > 1 ? "s" : ""}
              </Text>
              <Text style={styles.nodeSub}>Cargo</Text>
            </View>
          </>
        )}
      </View>

      {/* Footer */}
      {coupling.startLocation && (
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Origin </Text>
          <Text style={styles.footerValue}>{coupling.startLocation}</Text>
        </View>
      )}
    </View>
  );
}

function ChainArrow() {
  return (
    <View style={styles.arrowWrap}>
      <ArrowRight color={Colors.borderHi} size={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 14,
    position: "relative",
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  couplingId: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: "monospace",
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  stateText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sealBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,153,0.3)",
  },
  sealText: {
    color: Colors.green,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  chain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  chainNode: {
    alignItems: "center",
    minWidth: 56,
    flex: 1,
  },
  nodeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  nodeLabel: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  nodeSub: {
    color: Colors.textDim,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 1,
  },
  arrowWrap: {
    paddingHorizontal: 4,
    alignItems: "center",
  },
  bobtailSeparator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  bobtailLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,181,71,0.3)",
    borderStyle: "dashed",
  },
  bobtailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,181,71,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,181,71,0.35)",
    marginHorizontal: 6,
  },
  bobtailText: {
    color: Colors.amber,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  footerLabel: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
  },
  footerValue: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
