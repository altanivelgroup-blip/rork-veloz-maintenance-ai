import { Award, ExternalLink } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { WarrantyProfile } from "@/constants/mockData";

type Props = {
  warranty: WarrantyProfile | null;
  coveredComponent?: string;
  onVerify?: () => void;
};

export default function WarrantyBanner({ warranty, coveredComponent, onVerify }: Props) {
  if (!warranty) {
    return (
      <View style={styles.noWarranty}>
        <Award color={Colors.textDim} size={14} />
        <Text style={styles.noWarrantyText}>No warranty coverage on file</Text>
      </View>
    );
  }

  const expireDate = new Date(warranty.expirationDate);
  const isActive = expireDate.getTime() > Date.now();
  const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.banner, isActive ? styles.activeBanner : styles.expiredBanner]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBubble, {
          backgroundColor: isActive ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.06)",
        }]}>
          <Award color={isActive ? Colors.gold : Colors.textDim} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: isActive ? Colors.gold : Colors.textDim }]}>
            {isActive ? "Warranty Active" : "Warranty Expired"}
          </Text>
          <Text style={styles.sub}>
            {warranty.provider} · {warranty.coverageType === "manufacturer" ? "Manufacturer" : warranty.coverageType === "extended" ? "Extended" : "Aftermarket"}
            {isActive && ` · ${daysLeft} days left`}
          </Text>
        </View>
      </View>

      {isActive && (
        <>
          <View style={styles.detailGrid}>
            <WarrantyDetail label="Policy" value={warranty.policyNumber} />
            <WarrantyDetail label="Coverage" value={`Up to ${warranty.maxMileageLimit.toLocaleString()} mi`} />
            <WarrantyDetail label="Expires" value={expireDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} />
            <WarrantyDetail label="Type" value={warranty.coverageType === "manufacturer" ? "Manufacturer" : warranty.coverageType === "extended" ? "Extended" : "Aftermarket"} />
          </View>

          <View style={styles.componentsWrap}>
            {warranty.coveredComponents.map((c) => (
              <View
                key={c}
                style={[
                  styles.componentTag,
                  coveredComponent && c.toLowerCase().includes(coveredComponent.toLowerCase())
                    ? { backgroundColor: "rgba(212,175,55,0.25)", borderColor: Colors.gold }
                    : null,
                ]}
              >
                <Text style={[styles.componentText, {
                  color: coveredComponent && c.toLowerCase().includes(coveredComponent.toLowerCase()) ? Colors.gold : Colors.textMuted,
                }]}>{c}</Text>
              </View>
            ))}
          </View>

          {coveredComponent && (
            <View style={styles.coverageAlert}>
              <View style={styles.coverageDot} />
              <Text style={styles.coverageText}>
                Warranty Coverage Active: This component may be covered under policy {warranty.policyNumber}. Submit claim before closing work order.
              </Text>
            </View>
          )}

          {onVerify && (
            <Pressable onPress={onVerify} style={styles.verifyBtn}>
              <ExternalLink color={Colors.gold} size={13} />
              <Text style={styles.verifyText}>Verify Coverage</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

function WarrantyDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 16, padding: 14, borderWidth: 1, overflow: "hidden" },
  activeBanner: { backgroundColor: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.3)" },
  expiredBanner: { backgroundColor: "rgba(255,255,255,0.02)", borderColor: Colors.border },
  noWarranty: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: Colors.border,
  },
  noWarrantyText: { color: Colors.textDim, fontSize: 12, fontWeight: "600" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBubble: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  sub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  detail: {
    flexBasis: "47%", flexGrow: 1, padding: 8,
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  detailLabel: { color: Colors.textDim, fontSize: 9, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  detailValue: { color: Colors.text, fontSize: 12, fontWeight: "700", marginTop: 2 },
  componentsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  componentTag: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  componentText: { fontSize: 10, fontWeight: "700" },
  coverageAlert: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginTop: 12, padding: 10, borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.12)", borderWidth: 1, borderColor: "rgba(212,175,55,0.4)",
  },
  coverageDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: Colors.gold, marginTop: 4 },
  coverageText: { color: Colors.gold, fontSize: 11, fontWeight: "600", flex: 1, lineHeight: 16 },
  verifyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 10, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.1)", borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
  },
  verifyText: { color: Colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
});
