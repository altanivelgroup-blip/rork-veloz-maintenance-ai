import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { Colors, Gradients } from "@/constants/colors";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  gradient?: readonly [string, string, ...string[]];
  glow?: boolean;
};

export default function Card({ children, style, onPress, gradient, glow = false }: Props) {
  const colors = gradient ?? Gradients.card;
  const content = (
    <View style={[styles.wrap, glow && styles.glow, style as ViewStyle]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.border} pointerEvents="none" />
      <View style={styles.inner}>{children}</View>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] }]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.panel,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  glow: {
    shadowColor: "#3D8BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  inner: { padding: 16 },
});
