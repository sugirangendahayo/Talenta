import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ReactNode } from "react";

interface AuthContainerProps {
  children: ReactNode;
  stickyHeaderIndices?: number[];
}

export default function AuthContainer({
  children,
  stickyHeaderIndices,
}: AuthContainerProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={stickyHeaderIndices}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
