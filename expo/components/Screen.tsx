import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gradients } from "@/constants/colors";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export default function Screen({ children, scroll = true, contentStyle, edges = ["top"] }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.bg} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.glowA} pointerEvents="none" />
      <View style={styles.glowB} pointerEvents="none" />
      <SafeAreaView style={styles.safe} edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050B18" },
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  glowA: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "#1E5BFF",
    opacity: 0.12,
  },
  glowB: {
    position: "absolute",
    bottom: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "#5EE7FF",
    opacity: 0.07,
  },
});
