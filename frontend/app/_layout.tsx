// import "react-native-reanimated";
import "../global.css";
import { Stack } from "expo-router";
import { View, ActivityIndicator, Text as RNText } from "react-native";
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = { anchor: "jobseeker-tabs" };

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

  // apply default font
  (RNText as any).defaultProps = (RNText as any).defaultProps || {};
  (RNText as any).defaultProps.style = { fontFamily: "Quicksand_400Regular" };

  return (
    <SafeAreaProvider>
      <Stack>
        {/* Welcome screens */}
        <Stack.Screen name="welcome/Step1" options={{ headerShown: false }} />
        <Stack.Screen name="welcome/Step2" options={{ headerShown: false }} />

        {/* ------------------------------- */}
        {/* JOB SEEKER TABS (commented for now) */}
        {/* ------------------------------- */}
        {/*
        <Stack.Screen
          name="(jobseeker-tabs)"
          options={{ headerShown: false }}
        />
        */}

        {/* ------------------------------- */}
        {/* EMPLOYER TABS (active during design phase) */}
        {/* ------------------------------- */}
        <Stack.Screen name="(employer-tabs)" options={{ headerShown: false }} />

        {/* ------------------------------- */}
        {/* Job seeker dynamic screens (commented until backend ready) */}
        {/* ------------------------------- */}
        {/*
        <Stack.Screen
          name="jobseekers/job-details/[id]"
          options={{ headerShown: false }}
        />
        */}

        {/* 
        ❌ This was causing warnings. Route does NOT exist.
        <Stack.Screen
          name="jobseekers/Applications"
          options={{ headerShown: false }}
        />
        */}

        {/* Auth screens */}
        <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
