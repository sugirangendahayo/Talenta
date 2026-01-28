// _layout.tsx (Updated)
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from "@expo-google-fonts/quicksand";
// REMOVED: AsyncStorage import (no longer needed here)
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text as RNText, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import "../global.css";

export const unstable_settings = { anchor: "(jobseeker-tabs)" };

// Navigation logic component
function RootLayoutNav() {
  const { user, role, loading: authLoading, hasSeenOnboarding } = useAuth(); // UPDATED: Add hasSeenOnboarding from context
  const segments = useSegments();
  const router = useRouter();
  // REMOVED: Local hasSeenOnboarding state
  const [isReady, setIsReady] = useState(false);

  // UPDATED: New useEffect to set isReady when hasSeenOnboarding is loaded (not null)
  useEffect(() => {
    if (hasSeenOnboarding !== null) {
      setIsReady(true);
    }
  }, [hasSeenOnboarding]);

  // Navigation logic
  useEffect(() => {
    // Wait until both auth and onboarding status are loaded
    if (!isReady || authLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inWelcomeGroup = segments[0] === "welcome";
    const inJobseekerTabs = segments[0] === "(jobseeker-tabs)";
    const inEmployerTabs = segments[0] === "(employer-tabs)";

    // console.log("Navigation check:", {
    //   hasSeenOnboarding,
    //   user: !!user,
    //   role,
    //   segments,
    // });

    // PRIORITY 1: Show onboarding if user hasn't seen it (regardless of auth status)
    if (hasSeenOnboarding === false && !inWelcomeGroup) {
      console.log("→ Redirecting to onboarding");
      router.replace("/welcome/Step1");
      return;
    }

    // PRIORITY 2: User has seen onboarding but is not logged in
    if (
      hasSeenOnboarding === true &&
      !user &&
      !inAuthGroup &&
      !inWelcomeGroup
    ) {
      console.log(" Redirecting to signin (not logged in)");
      router.replace("/auth/signin");
      return;
    }

    // PRIORITY 3: User is logged in
    if (user && role) {
      // Redirect away from auth/welcome screens to dashboard
      if (inAuthGroup || inWelcomeGroup) {
        console.log("→ Redirecting to dashboard (logged in, on auth screen)");
        if (role === "jobseeker") {
          router.replace("/(jobseeker-tabs)/jobseekers/Home");
        } else if (role === "employer") {
          router.replace("/(employer-tabs)/employers/Dashboard");
        }
        return;
      }

      // Prevent cross-role access
      if (role === "jobseeker" && inEmployerTabs) {
        console.log("→ Jobseeker tried to access employer tabs");
        router.replace("/(jobseeker-tabs)/jobseekers/Home");
      } else if (role === "employer" && inJobseekerTabs) {
        console.log("→ Employer tried to access jobseeker tabs");
        router.replace("/(employer-tabs)/employers/Dashboard");
      }
    }
  }, [user, role, authLoading, segments, hasSeenOnboarding, isReady]);

  // Show loading screen while checking initial state
  if (!isReady || authLoading || hasSeenOnboarding === null) {
    // UPDATED: Add check for hasSeenOnboarding === null
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Welcome screens */}
      <Stack.Screen name="welcome/Step1" options={{ headerShown: false }} />
      <Stack.Screen name="welcome/Step2" options={{ headerShown: false }} />

      {/* Tab layouts */}
      <Stack.Screen name="(jobseeker-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(employer-tabs)" options={{ headerShown: false }} />

      {/* Job seeker screens */}
      <Stack.Screen
        name="jobseekers/job-details/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/complete-profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/upload-cv"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/Applications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="jobseekers/notifications"
        options={{ headerShown: false }}
      />
      {/* Employer screens */}
      <Stack.Screen
        name="employer/job-details/[id]"
        options={{ headerShown: false }}
      />

      {/* Auth screens */}
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />

      {/* Employer screens */}
      <Stack.Screen name="employer/post-job" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Apply default font
  (RNText as any).defaultProps = (RNText as any).defaultProps || {};
  (RNText as any).defaultProps.style = { fontFamily: "Quicksand_400Regular" };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutNav />
          <Toaster
            position="top-center"
            duration={2000}
            richColors
            visibleToasts={2}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
