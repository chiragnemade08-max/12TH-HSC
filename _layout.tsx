import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { View, ActivityIndicator, Text, useColorScheme } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/context/AppContext";
import { SocialProvider } from "@/context/SocialContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import AuthScreen from "@/components/AuthScreen";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, authLoading, isOnline } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const [skipped, setSkipped] = useState(false);

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.background }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  if (!user && !skipped) {
    return <AuthScreen onSkip={() => setSkipped(true)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {!isOnline && (
        <View style={{ backgroundColor: "#FFF4D6", paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: "#7A5700", textAlign: "center", fontSize: 12, fontFamily: "Inter_500Medium" }}>
            Offline mode — your changes are saved on this device and will sync when you’re online.
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: C.surface },
          headerTintColor: C.text,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
          contentStyle: { backgroundColor: C.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-timetable"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            presentation: "modal",
            headerStyle: { backgroundColor: C.surface },
            headerTintColor: C.text,
          }}
        />
        <Stack.Screen
          name="daily-report"
          options={{
            title: "Daily Report",
            presentation: "modal",
            headerStyle: { backgroundColor: C.surface },
            headerTintColor: C.text,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError && !forceRender) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <SocialProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <AuthGate>
                    <RootLayoutNav />
                  </AuthGate>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SocialProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
