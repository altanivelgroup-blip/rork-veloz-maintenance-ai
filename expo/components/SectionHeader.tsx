import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function SectionHeader({ title, kicker, right }: { title: string; kicker?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        {kicker && <Text style={styles.kicker}>{kicker}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 },
  kicker: { color: Colors.cyan, fontSize: 10, letterSpacing: 2.4, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
});
