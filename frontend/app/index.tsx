// app/index.tsx
import AppLoadingScreen from "@/components/common/AppLoadingScreen";

export default function Index() {
  // RootLayoutNav chooses the final route once auth, role, and onboarding are
  // resolved. Keeping this screen neutral prevents a Step 1 flash on sign-in.
  return <AppLoadingScreen />;
}
