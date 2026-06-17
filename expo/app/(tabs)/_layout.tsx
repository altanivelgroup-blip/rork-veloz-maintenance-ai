import { Tabs } from "expo-router";
import { BarChart3, ClipboardCheck, Cpu, Truck, Container } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/colors";

function TabBarBg() {
  if (Platform.OS === "ios") {
    return <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />;
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8,16,34,0.96)" }]} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 1,
          borderTopColor: "rgba(120,180,255,0.12)",
          backgroundColor: "transparent",
          elevation: 0,
          height: Platform.OS === "ios" ? 86 : 70,
          paddingTop: 8,
        },
        tabBarBackground: () => <TabBarBg />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trucks"
        options={{
          title: "Trucks",
          tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trailers"
        options={{
          title: "Trailers",
          tabBarIcon: ({ color, size }) => <Container color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: "Inspections",
          tabBarIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "Fleet AI",
          tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
