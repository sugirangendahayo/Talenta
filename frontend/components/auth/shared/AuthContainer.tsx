import { ReactNode } from "react";
import KeyboardWrapper from "@/components/common/KeyboardWrapper";
import { useTheme } from "@/contexts/ThemeContext";

interface AuthContainerProps {
  children: ReactNode;
  stickyHeaderIndices?: number[];
}

export default function AuthContainer({
  children,
  stickyHeaderIndices,
}: AuthContainerProps) {
  const { isDark } = useTheme();
  return (
    <KeyboardWrapper
      contentStyle={{ backgroundColor: isDark ? '#080A08' : 'white' }}
      bottomOffset={32}
    >
      {children}
    </KeyboardWrapper>
  );
}
