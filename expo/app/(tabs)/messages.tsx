import { MessageCircle, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import ConversationRow from "@/components/ConversationRow";
import ConversationDetailPanel from "@/components/ConversationDetailPanel";
import { Colors } from "@/constants/colors";
import { DRIVERS } from "@/constants/mockData";
import { useFleet } from "@/providers/FleetProvider";
import {
  buildConversationId,
  type Conversation,
  type FleetConversationType,
} from "@/services/messagingService";
import { getFleetDb } from "@/services/firebase";

type FilterKey = "all" | FleetConversationType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fleet", label: "Fleet" },
  { key: "driver", label: "Driver" },
  { key: "shipment", label: "Shipment" },
  { key: "dispatch", label: "Dispatch" },
  { key: "emergency", label: "Emergency" },
  { key: "support", label: "Support" },
  { key: "organization", label: "Org" },
];

type DraftConversation = {
  id: string;
  type: FleetConversationType;
  entityId: string;
  title: string;
};

export default function MessagesScreen() {
  const { incidents, sessions } = useFleet();
  const drivers = DRIVERS;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const dbAvailable = getFleetDb() !== null;

  // Seed a deterministic list of conversations the fleet operator can open.
  // These map directly to the deterministic `type-entityId` IDs the shared
  // messaging service uses, so ensureConversation() will hydrate the same
  // Firestore docs on open.
  const seedConversations: DraftConversation[] = useMemo(() => {
    const list: DraftConversation[] = [];

    // Fleet-wide channel
    list.push({
      id: buildConversationId("fleet", "veloz-fleet-01"),
      type: "fleet",
      entityId: "veloz-fleet-01",
      title: "Veloz Fleet — Dispatch Channel",
    });

    // Per-driver threads (from active sessions + driver roster)
    const seenDrivers = new Set<string>();
    for (const s of sessions) {
      if (s.status !== "active" || seenDrivers.has(s.operatorId)) continue;
      seenDrivers.add(s.operatorId);
      list.push({
        id: buildConversationId("driver", s.operatorId),
        type: "driver",
        entityId: s.operatorId,
        title: `Driver · ${s.operatorName}`,
      });
    }
    // Fallback to driver roster if sessions are sparse
    for (const d of drivers.slice(0, 4)) {
      if (seenDrivers.has(d.id)) continue;
      seenDrivers.add(d.id);
      list.push({
        id: buildConversationId("driver", d.id),
        type: "driver",
        entityId: d.id,
        title: `Driver · ${d.name}`,
      });
    }

    // Per-shipment threads (from active sessions)
    for (const s of sessions.filter((s) => s.status === "active")) {
      list.push({
        id: buildConversationId("shipment", s.sessionId),
        type: "shipment",
        entityId: s.sessionId,
        title: `Shipment · ${s.sessionId.toUpperCase()}`,
      });
    }

    // Dispatch channel
    list.push({
      id: buildConversationId("dispatch", "veloz-dispatch-01"),
      type: "dispatch",
      entityId: "veloz-dispatch-01",
      title: "Dispatch Coordination",
    });

    // Emergency threads — one per open incident
    for (const inc of incidents.filter((i) => i.status !== "resolved").slice(0, 3)) {
      list.push({
        id: buildConversationId("emergency", inc.id),
        type: "emergency",
        entityId: inc.id,
        title: `Emergency · ${inc.title}`,
      });
    }

    // Support + Organization channels
    list.push({
      id: buildConversationId("support", "veloz-org-01"),
      type: "support",
      entityId: "veloz-org-01",
      title: "Veloz Support",
    });
    list.push({
      id: buildConversationId("organization", "veloz-org-01"),
      type: "organization",
      entityId: "veloz-org-01",
      title: "Veloz Organization",
    });

    return list;
  }, [sessions, drivers, incidents]);

  const filtered = useMemo(() => {
    let list = seedConversations;
    if (filter !== "all") list = list.filter((c) => c.type === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [seedConversations, filter, query]);

  const active = openId ? seedConversations.find((c) => c.id === openId) ?? null : null;

  // ── Conversation detail view ────────────────────────────
  if (active) {
    return (
      <ConversationDetailPanel
        conversationId={active.id}
        type={active.type}
        entityId={active.entityId}
        title={active.title}
        onBack={() => setOpenId(null)}
      />
    );
  }

  // ── Conversation list ───────────────────────────────────
  return (
    <Screen>
      <SectionHeader kicker="VelozOS Messaging" title="Messages" />

      {/* Unavailable banner */}
      {!dbAvailable && (
        <View style={styles.unavailBanner}>
          <MessageCircle color={Colors.amber} size={16} />
          <Text style={styles.unavailText}>
            Messaging is currently unavailable — Firebase is not configured in this environment.
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search color={Colors.textDim} size={15} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search conversations…"
          placeholderTextColor={Colors.textDim}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Pressable key={f.key} onPress={() => setFilter(f.key)} hitSlop={4}>
            <View style={[styles.chip, filter === f.key && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* List */}
      <View style={styles.list}>
        {filtered.map((c) => (
          <ConversationRow
            key={c.id}
            conversation={c as unknown as Conversation}
            onPress={(id) => setOpenId(id)}
          />
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MessageCircle color={Colors.textDim} size={32} />
            <Text style={styles.emptyTitle}>No conversations yet.</Text>
            <Text style={styles.emptySub}>
              {dbAvailable
                ? "Open a fleet, driver, shipment, or emergency channel to start messaging."
                : "Configure Firestore to enable live messaging."}
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  unavailBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "rgba(255,181,71,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,181,71,0.30)",
  },
  unavailText: { flex: 1, color: Colors.amber, fontSize: 12, fontWeight: "700", lineHeight: 17 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "500", paddingVertical: 11 },

  filterRow: { gap: 8, paddingHorizontal: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipActive: { backgroundColor: "rgba(94,231,255,0.12)", borderColor: "rgba(94,231,255,0.45)" },
  chipText: { color: Colors.textMuted, fontSize: 11.5, fontWeight: "800", letterSpacing: 0.3 },
  chipTextActive: { color: Colors.cyan },

  list: { gap: 10 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 56, paddingHorizontal: 24 },
  emptyTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  emptySub: { color: Colors.textDim, fontSize: 12.5, textAlign: "center", lineHeight: 18 },
});
