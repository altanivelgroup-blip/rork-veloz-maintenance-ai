import { ArrowLeft, Send, Users, ShieldAlert, MessageCircleOff } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "@/constants/colors";
import MessageBubble from "@/components/MessageBubble";
import {
  buildConversationId,
  ensureConversation,
  sendMessage,
  subscribeMessages,
  subscribeParticipants,
  type Conversation,
  type ConversationParticipant,
  type FleetConversationType,
  type Message,
} from "@/services/messagingService";
import { getFleetDb } from "@/services/firebase";
import { FLEET_SCOPE, FLEET_SENDER_NAME } from "@/services/fleetMessagingScope";

type Props = {
  conversationId: string;
  type: FleetConversationType;
  entityId: string;
  title: string;
  onBack: () => void;
};

type LoadState = "loading" | "unavailable" | "unauthorized" | "ready";

export default function ConversationDetailPanel({ conversationId, type, entityId, title, onBack }: Props) {
  const [state, setState] = useState<LoadState>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const dbAvailable = useMemo(() => getFleetDb() !== null, []);

  // Ensure conversation exists + open real-time subscriptions
  useEffect(() => {
    let unsubMsgs: (() => void) | null = null;
    let unsubParts: (() => void) | null = null;
    let cancelled = false;

    async function open() {
      if (!dbAvailable) {
        if (!cancelled) setState("unavailable");
        return;
      }
      try {
        // Ensure the conversation doc + caller participant row exist
        await ensureConversation(FLEET_SCOPE, {
          type,
          entityId,
          title,
        });

        // Subscribe to messages (access is checked inside the service)
        unsubMsgs = subscribeMessages(
          FLEET_SCOPE,
          conversationId,
          (msgs) => {
            if (cancelled) return;
            setMessages(msgs);
            setState("ready");
            // auto-scroll to bottom on next tick
            requestAnimationFrame(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            });
          },
          (err) => {
            if (cancelled) return;
            if (/denied|outside your fleet/i.test(err.message)) {
              setAccessDenied(true);
              setState("unauthorized");
            } else {
              setState("unavailable");
            }
          },
        );

        unsubParts = subscribeParticipants(
          FLEET_SCOPE,
          conversationId,
          (parts) => {
            if (!cancelled) setParticipants(parts);
          },
          () => {
            // participant errors are non-fatal
          },
        );
      } catch {
        if (!cancelled) setState("unavailable");
      }
    }

    void open();
    return () => {
      cancelled = true;
      unsubMsgs?.();
      unsubParts?.();
    };
    // Re-open if the conversation changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, dbAvailable]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      await sendMessage(FLEET_SCOPE, conversationId, body, FLEET_SENDER_NAME);
    } catch (err) {
      // restore draft on failure so the message isn't lost
      setDraft(body);
      const msg = err instanceof Error ? err.message : "Failed to send";
      if (/denied|outside your fleet/i.test(msg)) {
        setAccessDenied(true);
        setState("unauthorized");
      }
    } finally {
      setSending(false);
    }
  };

  // ── States ──────────────────────────────────────────────

  if (state === "unavailable") {
    return (
      <View style={styles.stateWrap}>
        <Header onBack={onBack} title={title} />
        <View style={styles.stateBody}>
          <MessageCircleOff color={Colors.amber} size={36} />
          <Text style={styles.stateTitle}>Messaging is currently unavailable.</Text>
          <Text style={styles.stateSub}>
            Firebase is not configured in this environment. Set the Firestore env vars to enable live messaging.
          </Text>
        </View>
      </View>
    );
  }

  if (state === "unauthorized" || accessDenied) {
    return (
      <View style={styles.stateWrap}>
        <Header onBack={onBack} title={title} />
        <View style={styles.stateBody}>
          <ShieldAlert color={Colors.red} size={36} />
          <Text style={styles.stateTitle}>You do not have access to this conversation.</Text>
          <Text style={styles.stateSub}>
            This conversation is outside your fleet, organization, assigned drivers, shipments, or emergency incidents.
          </Text>
        </View>
      </View>
    );
  }

  // ── Ready / Loading ─────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={styles.flex}>
        <Header
          onBack={onBack}
          title={title}
          right={
            <Pressable
              onPress={() => setShowParticipants((v) => !v)}
              hitSlop={10}
              style={[styles.partBtn, showParticipants && styles.partBtnActive]}
            >
              <Users color={showParticipants ? Colors.cyan : Colors.textMuted} size={16} />
              <Text style={[styles.partCount, { color: showParticipants ? Colors.cyan : Colors.textMuted }]}>
                {participants.length || "—"}
              </Text>
            </Pressable>
          }
        />

        {showParticipants && (
          <View style={styles.partPanel}>
            <Text style={styles.partPanelTitle}>PARTICIPANTS</Text>
            {participants.length === 0 ? (
              <Text style={styles.partEmpty}>No participants subscribed yet.</Text>
            ) : (
              participants.map((p) => (
                <View key={p.userId} style={styles.partItem}>
                  <View style={styles.partDot} />
                  <Text style={styles.partName}>{p.userId}</Text>
                  <Text style={styles.partRole}>{p.role}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.msgList}
          keyboardShouldPersistTaps="handled"
        >
          {state === "loading" && messages.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.cyan} size="small" />
              <Text style={styles.loadingText}>Loading messages…</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyThread}>
              <MessageCircleOff color={Colors.textDim} size={28} />
              <Text style={styles.emptyThreadText}>No messages yet. Start the conversation below.</Text>
            </View>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} message={m} isMine={m.senderId === FLEET_SCOPE.userId} />
            ))
          )}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composerBar}>
          <View style={styles.composerInputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message…"
              placeholderTextColor={Colors.textDim}
              style={styles.composerInput}
              multiline
              maxLength={2000}
              editable={!sending}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            hitSlop={6}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <View
              style={[
                styles.sendBtn,
                (!draft.trim() || sending) && styles.sendBtnDisabled,
              ]}
            >
              <LinearGradient
                colors={Gradients.blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {sending ? (
                <ActivityIndicator color="#fff" size={16} />
              ) : (
                <Send color="#fff" size={16} />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Header({
  onBack,
  title,
  right,
}: {
  onBack: () => void;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
        <ArrowLeft color={Colors.text} size={20} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stateWrap: { flex: 1, backgroundColor: "#050B18" },
  stateBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  stateTitle: { color: Colors.text, fontSize: 16, fontWeight: "800", textAlign: "center" },
  stateSub: { color: Colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "rgba(8,16,34,0.86)",
    gap: 8,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  headerRight: { minWidth: 44 },

  partBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  partBtnActive: { borderColor: "rgba(94,231,255,0.45)", backgroundColor: "rgba(94,231,255,0.12)" },
  partCount: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },

  partPanel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(20,40,71,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  partPanelTitle: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  partEmpty: { color: Colors.textDim, fontSize: 12.5 },
  partItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  partDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
  partName: { color: Colors.text, fontSize: 13, fontWeight: "700", flex: 1 },
  partRole: { color: Colors.textMuted, fontSize: 11, fontWeight: "700" },

  msgList: { padding: 16, paddingBottom: 24, gap: 2 },
  loadingWrap: { alignItems: "center", gap: 10, paddingVertical: 40 },
  loadingText: { color: Colors.textDim, fontSize: 12.5, fontWeight: "600" },
  emptyThread: { alignItems: "center", gap: 10, paddingVertical: 48, paddingHorizontal: 16 },
  emptyThreadText: { color: Colors.textDim, fontSize: 13, fontWeight: "600", textAlign: "center" },

  composerBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: "rgba(8,16,34,0.92)",
  },
  composerInputWrap: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
  },
  composerInput: {
    color: Colors.text,
    fontSize: 14.5,
    fontWeight: "500",
    minHeight: 22,
    padding: 0,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sendBtnDisabled: { opacity: 0.5 },
});
