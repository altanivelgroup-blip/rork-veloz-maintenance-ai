import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FleetProvider } from "@/providers/FleetProvider";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.navy },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.navy },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="truck/[id]" options={{ title: "Truck Profile" }} />
      <Stack.Screen name="trailer/[id]" options={{ title: "Trailer Profile" }} />
      <Stack.Screen name="inspection/new" options={{ title: "New Inspection", presentation: "modal" }} />
      <Stack.Screen name="inspection/[id]" options={{ title: "Inspection" }} />
      <Stack.Screen name="incident/new" options={{ title: "New Incident", presentation: "modal" }} />
      <Stack.Screen name="incident/[id]" options={{ title: "Incident" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FleetProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.navy }}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </FleetProvider>
    </QueryClientProvider>
  );
}
