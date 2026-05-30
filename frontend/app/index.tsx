// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Always start with Step1 (one)
  return <Redirect href="/welcome/Step1" />;
}
