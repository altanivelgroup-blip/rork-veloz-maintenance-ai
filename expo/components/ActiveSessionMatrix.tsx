import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Car, Container, Truck, User } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { EquipmentSession } from "@/constants/mockData";

type Props = {
  sessions: EquipmentSession[];
};

export default function ActiveSessionMatrix({ sessions }: Props) {
  if (sessions.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      {sessions.map((session) => (
        <SessionChain key={session.sessionId} session={session} />
      ))}
    </View>
  );
}

function SessionChain({ session }: { session: EquipmentSession }) {
  const cargoCount = session.cargoManifest.length;
  const hasTrailer = !!session.trailerId;

  return (
    <Pressable onPress={() => router.push(`/truck/${session.truckId}`)}>
      <View style={styles.chainCard}>
        <LinearGradient
          colors={["rgba(61,139,255,0.08)", "rgba(94,231,255,0.04)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.chainBorder} pointerEvents="none" />

        {/* Header */}
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionId}>{session.sessionId.toUpperCase()}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          {session.startLocation && (
            <Text style={styles.locationText}>{session.startLocation}</Text>
          )}
        </View>

        {/* Chain: Driver → Truck → Trailer → Cargo */}
        <View style={styles.chain}>
          <ChainNode
            icon={<User color="#5EE7FF" size={14} />}
            label={session.operatorName}
            sub="Operator"
            color="#5EE7FF"
            onPress={() => router.push(`/truck/${session.truckId}`)}
          />
          <ChainArrow />
          <ChainNode
            icon={<Truck color="#7CC4FF" size={14} />}
            label={session.truckId === "t1" ? "Veloz 01" : session.truckId === "t2" ? "Veloz 02" : session.truckId === "t3" ? "Veloz 03" : session.truckId === "t4" ? "Veloz 04" : "Veloz 05"}
            sub="Truck"
            color="#7CC4FF"
            onPress={() => router.push(`/truck/${session.truckId}`)}
          />
          {hasTrailer && (
            <>
              <ChainArrow />
              <ChainNode
                icon={<Container color={Colors.cyan} size={14} />}
                label={session.trailerId === "tr1" ? "Wedge 40" : session.trailerId === "tr2" ? "Gooseneck 36" : session.trailerId === "tr3" ? "Enclosed 28" : session.trailerId === "tr4" ? "Skid Hauler" : "Trailer"}
                sub="Trailer"
                color={Colors.cyan}
                onPress={() => session.trailerId && router.push(`/trailer/${session.trailerId}`)}
              />
            </>
          )}
          <ChainArrow />
          <ChainNode
            icon={<Car color={cargoCount > 0 ? Colors.green : Colors.textDim} size={14} />}
            label={cargoCount > 0 ? `${cargoCount} vehicle${cargoCount > 1 ? "s" : ""}` : "Empty"}
            sub="Cargo"
            color={cargoCount > 0 ? Colors.green : Colors.textDim}
            onPress={() => router.push(`/truck/${session.truckId}`)}
          />
        </View>

        {/* Footer stats */}
        <View style={styles.sessionFooter}>
          <Text style={styles.footerStat}>
            <Text style={styles.footerLabel}>Odom. start </Text>
            <Text style={styles.footerValue}>{session.startOdometer.toLocaleString()} mi</Text>
          </Text>
          {session.modifications.length > 0 && (
            <Text style={styles.footerStat}>
              <Text style={styles.footerLabel}>Swaps </Text>
              <Text style={[styles.footerValue, { color: Colors.amber }]}>{session.modifications.length}</Text>
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ChainNode({
  icon,
  label,
  sub,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.chainNode}>
      <View style={[styles.nodeIcon, { backgroundColor: `${color}18` }]}>
        {icon}
      </View>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.nodeSub}>{sub}</Text>
    </Pressable>
  );
}

function ChainArrow() {
  return (
    <View style={styles.arrowWrap}>
      <ArrowRight color={Colors.borderHi} size={14} />
      <View style={styles.arrowLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  chainCard: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 14,
    position: "relative",
  },
  chainBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sessionId: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: "monospace",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,153,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,211,153,0.3)",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: Colors.green,
  },
  liveText: {
    color: Colors.green,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  locationText: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: "auto",
  },
  chain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  chainNode: {
    alignItems: "center",
    minWidth: 60,
    flex: 1,
  },
  nodeIcon: {
    width: 34,
    height: 34,
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
    paddingHorizontal: 2,
    alignItems: "center",
  },
  arrowLine: {
    width: 1,
    height: 8,
    backgroundColor: Colors.borderHi,
    marginTop: 2,
  },
  sessionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  footerLabel: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
  },
  footerValue: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
});
