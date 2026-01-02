// import "react-native-reanimated";
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from "@expo-google-fonts/quicksand";
import { Stack } from "expo-router";
import { ActivityIndicator, Text as RNText, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import "../global.css";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen
            name="(employer-tabs)"
            options={{ headerShown: false }}
          />

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
          <Stack.Screen
            name="employer/post-job"
            options={{ headerShown: false }}
          />
        </Stack>
        <Toaster
          position="top-center"
          duration={2000}
          richColors
          visibleToasts={2}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
