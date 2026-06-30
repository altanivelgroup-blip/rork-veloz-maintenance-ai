import { ClipboardList, FileText, Wrench, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { Truck, Trailer } from "@/constants/mockData";

const { height: SCREEN_H } = Dimensions.get("window");

type Props = {
  visible: boolean;
  /** The truck or trailer this ticket is for. */
  asset: Truck | Trailer;
  /** Pre-selected component label, e.g. "Oil service" or "Brakes". */
  componentLabel?: string;
  /** Optional notes to seed into the text area. */
  initialNotes?: string;
  onClose: () => void;
  onSubmit?: (ticket: { component: string; serviceType: string; notes: string }) => void;
};

const SERVICE_TYPES = ["Repair", "Replacement", "Calibration", "Inspection"] as const;

/** Unified "Open Shop Repair Ticket" slide-up action drawer.
 *  Triggered by tapping a failed ModuleRow or the Maintenance Lockout banner. */
export default function ShopRepairTicket({ visible, asset, componentLabel, initialNotes, onClose, onSubmit }: Props) {
  const slide = useRef(new Animated.Value(SCREEN_H)).current;
  const [component, setComponent] = useState(componentLabel ?? "");
  const [serviceType, setServiceType] = useState<string>("Repair");
  const [notes, setNotes] = useState(initialNotes ?? "");

  useEffect(() => {
    if (visible) {
      setComponent(componentLabel ?? "");
      setNotes(initialNotes ?? "");
    }
    Animated.spring(slide, {
      toValue: visible ? 0 : SCREEN_H,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
    }).start();
  }, [visible, componentLabel, initialNotes, slide]);

  const handleSubmit = () => {
    onSubmit?.({ component, serviceType, notes });
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {/* Handle */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Open Shop Repair Ticket</Text>
              <Text style={styles.assetRef}>{asset.nickname}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X color={Colors.textMuted} size={20} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Component */}
            <Text style={styles.fieldLabel}>Component / System</Text>
            <View style={styles.inputWrap}>
              <Wrench color={Colors.cyan} size={14} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                value={component}
                onChangeText={setComponent}
                placeholder="e.g. Brakes, Engine, Suspension"
                placeholderTextColor={Colors.textDim}
              />
            </View>

            {/* Service Type */}
            <Text style={styles.fieldLabel}>Service Type</Text>
            <View style={styles.chipRow}>
              {SERVICE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setServiceType(t)}
                  style={[
                    styles.chip,
                    serviceType === t && { backgroundColor: Colors.cyan + "20", borderColor: Colors.cyan + "60" },
                  ]}
                >
                  <Text style={[styles.chipText, serviceType === t && { color: Colors.cyan }]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Mechanic Notes</Text>
            <View style={[styles.inputWrap, styles.notesWrap]}>
              <ClipboardList color={Colors.textDim} size={14} style={{ marginRight: 8, marginTop: 2 }} />
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe the issue, fault codes, or symptoms…"
                placeholderTextColor={Colors.textDim}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Attachment hint */}
            <View style={styles.attachRow}>
              <FileText color={Colors.textDim} size={13} />
              <Text style={styles.attachHint}>Upload photos, invoices, or DOT forms after saving.</Text>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <ClipboardList color="#fff" size={16} />
              <Text style={styles.submitText}>Open Repair Ticket</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end", zIndex: 110 },
  sheet: {
    backgroundColor: Colors.navy2,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SCREEN_H * 0.68, paddingBottom: 40,
    borderWidth: 1, borderColor: Colors.borderHi, borderBottomWidth: 0,
  },
  handleBar: { alignItems: "center", paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.textDim },
  headerRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 12 },
  sheetTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  assetRef: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", marginLeft: 12 },
  scrollContent: { paddingHorizontal: 20 },
  fieldLabel: { color: Colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginTop: 14 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: Colors.border,
  },
  textInput: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "600" },
  notesWrap: { alignItems: "flex-start", paddingVertical: 12 },
  notesInput: { minHeight: 90, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { color: Colors.textMuted, fontSize: 12, fontWeight: "700" },
  attachRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, opacity: 0.55 },
  attachHint: { color: Colors.textDim, fontSize: 11 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.cyan + "20",
    borderWidth: 1, borderColor: Colors.cyan + "50", marginTop: 20,
  },
  submitText: { color: Colors.cyan, fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});
