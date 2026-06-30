import {
  AlertTriangle, CheckCircle, Clock, DollarSign, Droplets, ExternalLink,
  FileSearch, Gauge, Lock, MapPin, ShieldAlert, X,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Colors } from "@/constants/colors";
import type { FuelTransaction } from "@/constants/mockData";

type Props = {
  visible: boolean;
  transaction: FuelTransaction | null;
  onClose: () => void;
};

const VENDOR_LOGOS: Record<string, { color: string; initials: string }> = {
  "Pilot Flying J": { color: "#E31837", initials: "PFJ" },
  "Love's Travel Stop": { color: "#FFD100", initials: "LV" },
  "TA Travel Center": { color: "#004B87", initials: "TA" },
};

export default function FuelTransactionDetailPanel({ visible, transaction, onClose }: Props) {
  if (!transaction) return null;

  const flag = transaction.flagged;
  const statusColor = flag
    ? flag.severity === "high" ? Colors.red : Colors.amber
    : Colors.green;
  const statusLabel = flag
    ? "Flagged — " + (flag.type === "capacity_exceeded"
      ? "Capacity Exceeded"
      : flag.type === "location_mismatch"
        ? "Location Mismatch"
        : "Rapid Consumption")
    : "Cleared";

  const vendor = VENDOR_LOGOS[transaction.vendorName] ?? { color: Colors.textDim, initials: transaction.vendorName.slice(0, 2).toUpperCase() };

  // Tank capacity for the truck (approximate from known fleet)
  const tankCapacity = useMemo(() => {
    const capacities: Record<string, number> = {
      t1: 34, t2: 34, t3: 36, t4: 40, t5: 36,
    };
    return capacities[transaction.assetId] ?? 34;
  }, [transaction.assetId]);

  const overCapacity = transaction.gallonsPumped > tankCapacity;
  const overPct = Math.round(((transaction.gallonsPumped - tankCapacity) / tankCapacity) * 100);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>TRANSACTION DETAIL</Text>
            <Text style={styles.h1}>Fuel Transaction</Text>
            <Text style={styles.txnId}>{transaction.transactionId.toUpperCase()}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Status banner */}
          <View style={[styles.statusBanner, { backgroundColor: flag ? (flag.severity === "high" ? "rgba(255,84,112,0.08)" : "rgba(255,181,71,0.08)") : "rgba(34,211,153,0.08)", borderColor: flag ? (flag.severity === "high" ? Colors.red + "40" : Colors.amber + "40") : Colors.green + "40" }]}>
            {flag ? (
              <ShieldAlert size={20} color={statusColor} />
            ) : (
              <CheckCircle size={20} color={Colors.green} />
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              {flag && <Text style={styles.statusSub}>{flag.detail}</Text>}
            </View>
          </View>

          {/* Quick stats row */}
          <View style={styles.quickStats}>
            <QuickStat
              icon={<DollarSign size={16} color={Colors.green} />}
              label="Total Cost"
              value={`$${transaction.totalAmount.toFixed(2)}`}
            />
            <QuickStat
              icon={<Droplets size={16} color={Colors.cyan} />}
              label="Gallons"
              value={`${transaction.gallonsPumped.toFixed(1)} gal`}
            />
            <QuickStat
              icon={<Gauge size={16} color={Colors.electric} />}
              label="Price/Gal"
              value={`$${transaction.pricePerGallon.toFixed(3)}`}
            />
          </View>

          {/* Vendor card */}
          <View style={styles.vendorCard}>
            <View style={[styles.vendorLogo, { backgroundColor: vendor.color + "20", borderColor: vendor.color + "50" }]}>
              <Text style={[styles.vendorInitials, { color: vendor.color }]}>{vendor.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{transaction.vendorName}</Text>
              <Text style={styles.vendorMeta}>
                {new Date(transaction.authTimestamp).toLocaleDateString(undefined, {
                  weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </Text>
              <Text style={styles.vendorMeta}>Card: {transaction.fuelCardNumber}</Text>
            </View>
          </View>

          {/* Discrepancy Matrix */}
          <Text style={styles.sectionTitle}>Discrepancy Matrix</Text>

          {/* GPS comparison */}
          <View style={styles.discRow}>
            <View style={styles.discCol}>
              <View style={styles.discIcon}>
                <MapPin size={14} color={Colors.cyan} />
              </View>
              <Text style={styles.discLabel}>Fuel Card Swipe Location</Text>
              <Text style={styles.discValue}>
                {transaction.locationGps.lat.toFixed(4)}, {transaction.locationGps.lng.toFixed(4)}
              </Text>
              <Text style={styles.discSub}>{transaction.vendorName}</Text>
            </View>
            <View style={styles.discVs}>
              <Text style={styles.discVsText}>VS</Text>
            </View>
            <View style={styles.discCol}>
              <View style={[styles.discIcon, { backgroundColor: flag?.type === "location_mismatch" ? Colors.redSoft : "rgba(94,231,255,0.1)" }]}>
                <MapPin size={14} color={flag?.type === "location_mismatch" ? Colors.red : Colors.cyan} />
              </View>
              <Text style={styles.discLabel}>Truck Telematics GPS</Text>
              <Text style={styles.discValue}>
                {flag?.type === "location_mismatch"
                  ? "Location mismatch!"
                  : "Within range"}
              </Text>
              <Text style={[styles.discSub, { color: flag?.type === "location_mismatch" ? Colors.red : Colors.green }]}>
                {flag?.type === "location_mismatch"
                  ? "> 500 ft buffer violation"
                  : "Location verified"}
              </Text>
            </View>
          </View>

          {/* Tank capacity comparison */}
          <View style={styles.discRow}>
            <View style={styles.discCol}>
              <View style={styles.discIcon}>
                <Droplets size={14} color={Colors.electric} />
              </View>
              <Text style={styles.discLabel}>Gallons Pumped</Text>
              <Text style={[styles.discValue, overCapacity && { color: Colors.amber }]}>
                {transaction.gallonsPumped.toFixed(1)} gal
              </Text>
            </View>
            <View style={styles.discVs}>
              <Text style={styles.discVsText}>VS</Text>
            </View>
            <View style={styles.discCol}>
              <View style={[styles.discIcon, { backgroundColor: overCapacity ? Colors.amberSoft : "rgba(124,196,255,0.1)" }]}>
                <Droplets size={14} color={overCapacity ? Colors.amber : Colors.electric} />
              </View>
              <Text style={styles.discLabel}>Tank Max Capacity</Text>
              <Text style={styles.discValue}>{tankCapacity} gal</Text>
              <Text style={[styles.discSub, { color: overCapacity ? Colors.amber : Colors.green }]}>
                {overCapacity
                  ? `${overPct}% over capacity`
                  : "Within capacity"}
              </Text>
            </View>
          </View>

          {/* Transaction meta */}
          <View style={styles.metaGrid}>
            <MetaItem label="Odometer at Fill" value={`${transaction.odometerAtFill.toLocaleString()} mi`} />
            <MetaItem label="Driver" value={transaction.driverName} />
            <MetaItem label="Asset" value={transaction.assetName} />
            <MetaItem label="Fuel Type" value={transaction.fuelType.toUpperCase()} />
            <MetaItem label="Card #" value={transaction.fuelCardNumber} />
            <MetaItem label="Transaction ID" value={transaction.transactionId} mono />
          </View>

          {/* Action Row */}
          <Text style={styles.sectionTitle}>Administrative Actions</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: Colors.greenSoft, borderColor: Colors.green + "50" }]}>
              <CheckCircle size={16} color={Colors.green} />
              <Text style={[styles.actionText, { color: Colors.green }]}>Force Approve</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: Colors.redSoft, borderColor: Colors.red + "50" }]}>
              <Lock size={16} color={Colors.red} />
              <Text style={[styles.actionText, { color: Colors.red }]}>Lock Fuel Card</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: "rgba(94,231,255,0.08)", borderColor: Colors.cyan + "40" }]}>
              <FileSearch size={16} color={Colors.cyan} />
              <Text style={[styles.actionText, { color: Colors.cyan }]}>Open Inquiry</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.qsWrap}>
      {icon}
      <Text style={styles.qsLabel}>{label}</Text>
      <Text style={styles.qsValue}>{value}</Text>
    </View>
  );
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, mono && { fontFamily: "monospace", fontSize: 10 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  h1: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  txnId: {
    color: Colors.textDim,
    fontSize: 11,
    fontFamily: "monospace",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "800",
  },
  statusSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  quickStats: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  qsWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qsLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 6,
    textTransform: "uppercase",
  },
  qsValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 14,
  },
  vendorLogo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  vendorInitials: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  vendorName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  vendorMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  discRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 10,
  },
  discCol: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  discIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(94,231,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  discLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  discValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  discSub: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 4,
  },
  discVs: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  discVsText: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    width: "47%",
    flexGrow: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
