import { ChevronRight, Truck, User, Package, Radio, Siren, LifeBuoy, Building2 } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { Conversation, FleetConversationType } from "@/services/messagingService";

const TYPE_META: Record<
  FleetConversationType,
  { label: string; icon: React.ComponentType<{ color: string; size: number }>; tint: string }
> = {
  fleet: { label: "Fleet", icon: Truck, tint: Colors.cyan },
  driver: { label: "Driver", icon: User, tint: Colors.blue },
  shipment: { label: "Shipment", icon: Package, tint: Colors.electric },
  dispatch: { label: "Dispatch", icon: Radio, tint: Colors.cyan },
  emergency: { label: "Emergency", icon: Siren, tint: Colors.red },
  support: { label: "Support", icon: LifeBuoy, tint: Colors.amber },
  organization: { label: "Organization", icon: Building2, tint: Colors.green },
};

function fmtRelative(createdAt: unknown): string {
  if (!createdAt) return "";
  const seconds =
    typeof createdAt === "object" && createdAt && "seconds" in (createdAt as Record<string, unknown>)
      ? (createdAt as { seconds: number }).seconds
      : typeof createdAt === "number"
        ? createdAt
        : 0;
  if (!seconds) return "";
  const now = Date.now();
  const then = seconds * 1000;
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString([], { month: "short", day: "numeric" });
}

type Props = {
  conversation: Conversation;
  onPress: (id: string) => void;
};

export default function ConversationRow({ conversation, onPress }: Props) {
  const meta = TYPE_META[conversation.type] ?? TYPE_META.fleet;
  const Icon = meta.icon;
  const time = fmtRelative(conversation.lastMessageAt);

  return (
    <Pressable onPress={() => onPress(conversation.id)} hitSlop={4}>
      {({ pressed }) => (
        <View style={[styles.row, pressed && { opacity: 0.85 }]}>
          <View style={[styles.iconBubble, { backgroundColor: meta.tint + "18", borderColor: meta.tint + "44" }]}>
            <Icon color={meta.tint} size={18} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{conversation.title}</Text>
              {time ? <Text style={styles.time}>{time}</Text> : null}
            </View>
            <Text style={styles.preview} numberOfLines={1}>
              {conversation.lastMessagePreview || `Open ${meta.label.toLowerCase()} conversation`}
            </Text>
            <View style={styles.tagRow}>
              <View style={[styles.tag, { borderColor: meta.tint + "55", backgroundColor: meta.tint + "12" }]}>
                <Text style={[styles.tagText, { color: meta.tint }]}>{meta.label.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <ChevronRight color={Colors.textDim} size={18} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { color: Colors.text, fontSize: 15, fontWeight: "800", flex: 1, letterSpacing: -0.2 },
  time: { color: Colors.textDim, fontSize: 10.5, fontWeight: "700", letterSpacing: 0.2 },
  preview: { color: Colors.textMuted, fontSize: 12.5, marginTop: 3, fontWeight: "500" },
  tagRow: { flexDirection: "row", marginTop: 7, gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  tagText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
});
