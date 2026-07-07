import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "@/constants/colors";
import type { Message } from "@/services/messagingService";

type Props = {
  message: Message;
  isMine: boolean;
};

function fmtTime(createdAt: unknown): string {
  if (!createdAt) return "";
  const seconds =
    typeof createdAt === "object" && createdAt && "seconds" in (createdAt as Record<string, unknown>)
      ? (createdAt as { seconds: number }).seconds
      : typeof createdAt === "number"
        ? createdAt
        : 0;
  if (!seconds) return "";
  const d = new Date(seconds * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubbleWrap, isMine && styles.bubbleWrapMine]}>
        {isMine ? (
          <LinearGradient
            colors={Gradients.blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={StyleSheet.absoluteFill} />
        )}
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          {!isMine && message.senderName ? (
            <Text style={styles.sender}>{message.senderName}</Text>
          ) : null}
          <Text style={[styles.body, isMine ? styles.bodyMine : styles.bodyTheirs]}>
            {message.body}
          </Text>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {fmtTime(message.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 10, paddingHorizontal: 2 },
  rowMine: { justifyContent: "flex-end" },
  bubbleWrap: {
    maxWidth: "82%",
    borderRadius: 18,
    overflow: "hidden",
  },
  bubbleWrapMine: { maxWidth: "82%" },
  bubble: { paddingVertical: 10, paddingHorizontal: 14 },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: "rgba(20,40,71,0.96)",
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
  },
  sender: {
    color: Colors.cyan,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  body: { fontSize: 14.5, lineHeight: 20, fontWeight: "500" },
  bodyMine: { color: "#FFFFFF" },
  bodyTheirs: { color: Colors.text },
  time: { fontSize: 10, fontWeight: "700", marginTop: 4, alignSelf: "flex-end", letterSpacing: 0.2 },
  timeMine: { color: "rgba(255,255,255,0.78)" },
  timeTheirs: { color: Colors.textDim },
});
