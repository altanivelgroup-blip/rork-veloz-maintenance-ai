import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Anchor, ChevronRight, Container, Gauge, MapPin, Route, ShieldCheck,
  ShieldAlert, Truck, Wrench, ClipboardList,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ActiveCouplingCard from "@/components/ActiveCouplingCard";
import Card from "@/components/Card";
import InspectionVault from "@/components/InspectionVault";
import OperationalTriageQueue from "@/components/OperationalTriageQueue";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors } from "@/constants/colors";
import { operationalSeverityMeta, operationalResolutionMeta } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";

export default function OperationsScreen() {
  const { operationsTicker, couplings, triageQueue, activeSessions, vaultEntries, trucks, trailers } = useFleet();
  const [activeTab, setActiveTab] = useState<"couplings" | "triage" | "vault">("couplings");

  const groundedList = [...trucks, ...trailers].filter((e) => e.roadReadyStatus === "out_of_service");
  const sosCount = triageQueue.filter((i) => i.severityTier === "critical_sos").length;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>VELOZ · OPERATIONS</Text>
          <Text style={styles.h1}>Fleet Orchestration</Text>
          <Text style={styles.sub}>
            Live command board · {couplings.length} active couplings · {triageQueue.length} open incidents
          </Text>
        </View>
        {sosCount > 0 && (
          <View style={styles.sosBadge}>
            <ShieldAlert color="#FF3366" size={14} />
            <Text style={styles.sosText}>{sosCount} SOS</Text>
          </View>
        )}
      </View>

      {/* Availability Ticker */}
      <View style={styles.tickerWrap}>
        <LinearGradient colors={["#13294C", "#0E1E3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.tickerBorder} pointerEvents="none" />
        <View style={styles.tickerRow}>
          <TickerTile icon={<Route color="#5EE7FF" size={16} />} label="In-Transit" value={operationsTicker.inTransit} color="#5EE7FF" />
          <TickerTile icon={<Truck color="#22D399" size={16} />} label="Available Bobtail" value={operationsTicker.availableBobtail} color="#22D399" />
          <TickerTile icon={<Container color="#7CC4FF" size={16} />} label="Avail. Trailers" value={operationsTicker.availableTrailers} color="#7CC4FF" />
          <TickerTile icon={<Anchor color="#FF5470" size={16} />} label="Grounded" value={operationsTicker.grounded} color="#FF5470" />
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {[
          { key: "couplings" as const, label: "Active Couplings", badge: couplings.length },
          { key: "triage" as const, label: "Triage Queue", badge: triageQueue.length, alert: sosCount > 0 },
          { key: "vault" as const, label: "Inspection Vault", badge: vaultEntries.length },
        ].map((tab) => (
          <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flex: 1 }}>
            <View style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, tab.alert && styles.tabBadgeAlert, activeTab === tab.key && { backgroundColor: "rgba(94,231,255,0.2)" }]}>
                <Text style={[styles.tabBadgeText, tab.alert && { color: "#FF3366" }, activeTab === tab.key && { color: Colors.cyan }]}>
                  {tab.badge}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {activeTab === "couplings" && (
          <>
            <SectionHeader kicker="Live Relationships" title="Active Equipment Couplings" />
            <View style={{ gap: 10 }}>
              {couplings.map((c) => (
                <ActiveCouplingCard key={c.couplingId} coupling={c} />
              ))}
            </View>

            {/* Bobtail section */}
            {couplings.filter((c) => c.state === "bobtail").length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Card>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: "rgba(255,181,71,0.14)" }]}>
                      <Truck color={Colors.amber} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoTitle}>Bobtail Units</Text>
                      <Text style={styles.infoSub}>
                        {couplings.filter((c) => c.state === "bobtail").length} truck{couplings.filter((c) => c.state === "bobtail").length > 1 ? "s" : ""} operating without a trailer. Units available for immediate hook-up.
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            )}
          </>
        )}

        {activeTab === "triage" && (
          <>
            <SectionHeader
              kicker="Operational Exceptions"
              title={`Triage Queue${sosCount > 0 ? ` · ${sosCount} SOS` : ""}`}
            />
            <OperationalTriageQueue incidents={triageQueue} />
          </>
        )}

        {activeTab === "vault" && (
          <>
            <InspectionVault />
          </>
        )}

        {/* Grounded Equipment */}
        {groundedList.length > 0 && (
          <>
            <SectionHeader kicker="Critical" title={`Grounded / Out of Service (${groundedList.length})`} />
            <View style={{ gap: 8 }}>
              {groundedList.map((eq) => {
                const kind: "truck" | "trailer" = "mileage" in eq ? "truck" : "trailer";
                return (
                  <Pressable key={eq.id} onPress={() => router.push(`/${kind}/${eq.id}`)}>
                    <View style={styles.groundedCard}>
                      <LinearGradient
                        colors={["rgba(255,84,112,0.2)", "rgba(255,84,112,0.03)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={[styles.infoIcon, { backgroundColor: "rgba(255,84,112,0.18)" }]}>
                        {kind === "truck" ? <Truck color={Colors.red} size={16} /> : <Container color={Colors.red} size={16} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groundedName}>{eq.nickname}</Text>
                        <Text style={styles.groundedSub}>
                          {kind === "truck" ? `${(eq as { year: number; make: string; model: string }).year} ${(eq as { year: number; make: string; model: string }).make} ${(eq as { year: number; make: string; model: string }).model}` : `${(eq as { year: number; make: string; model: string }).year} ${(eq as { year: number; make: string; model: string }).make} ${(eq as { year: number; make: string; model: string }).model}`} · Dead-Red
                        </Text>
                      </View>
                      <ChevronRight color={Colors.textMuted} size={16} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <SectionHeader kicker="Dispatch" title="Quick Actions" />
        <View style={styles.quickActions}>
          <Pressable onPress={() => router.push("/inspection/new")} style={styles.qaBtn}>
            <LinearGradient colors={["#1E5BFF", "#3D8BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <ClipboardList color="#fff" size={18} />
            <Text style={styles.qaText}>New Inspection</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/incident/new")} style={styles.qaBtn}>
            <LinearGradient colors={["#FF5470", "#E2334E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <ShieldAlert color="#fff" size={18} />
            <Text style={styles.qaText}>Report Incident</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function TickerTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <View style={styles.tickerTile}>
      {icon}
      <Text style={[styles.tickerValue, { color }]}>{value}</Text>
      <Text style={[styles.tickerLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, marginTop: 4 },
  kicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 2.4, fontWeight: "800", textTransform: "uppercase" },
  h1: { color: Colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.6, marginTop: 4 },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 4, lineHeight: 18 },
  sosBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(255,51,102,0.15)", borderWidth: 1, borderColor: "rgba(255,51,102,0.45)",
  },
  sosText: { color: "#FF3366", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  tickerWrap: {
    borderRadius: 20, overflow: "hidden", padding: 12, position: "relative",
    marginBottom: 14, marginTop: 8,
  },
  tickerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.borderHi,
  },
  tickerRow: { flexDirection: "row", gap: 8 },
  tickerTile: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tickerValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, marginTop: 6 },
  tickerLabel: { fontSize: 8, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 3, textAlign: "center" },
  tabBar: { flexDirection: "row", gap: 6, marginBottom: 14 },
  tab: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  tabActive: { borderColor: "rgba(94,231,255,0.45)", backgroundColor: "rgba(94,231,255,0.08)" },
  tabLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: "700" },
  tabLabelActive: { color: Colors.cyan },
  tabBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabBadgeAlert: { backgroundColor: "rgba(255,51,102,0.18)" },
  tabBadgeText: { color: Colors.textMuted, fontSize: 10, fontWeight: "800" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoTitle: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  infoSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  groundedCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,84,112,0.35)",
  },
  groundedName: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  groundedSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  quickActions: { flexDirection: "row", gap: 10 },
  qaBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16, overflow: "hidden",
  },
  qaText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
