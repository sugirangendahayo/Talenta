import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  LayoutAnimation,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  hasIcon?: boolean;
  showStrengthIndicator?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export default function PasswordField({
  hasIcon = true,
  showStrengthIndicator = false,
  showPassword: externalShowPassword,
  onTogglePassword,
  value,
  onChangeText,
  ...props
}: PasswordFieldProps) {
  const { t } = useTranslation("auth");
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Use external state if provided, otherwise use internal state
  const showPassword =
    externalShowPassword !== undefined
      ? externalShowPassword
      : internalShowPassword;
  const togglePassword =
    onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

  const password = value ? value.toString() : "";
  const hasValue = password.length > 0;

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isStrong = score >= 4;

  let label = "";
  let color = "#D1D5DB";

  if (score === 0) {
    label = "";
    color = "#D1D5DB";
  } else if (score <= 2) {
    label = t("passwordStrength.weak", { defaultValue: "Weak" });
    color = "#EF4444"; // red
  } else if (score === 3) {
    label = t("passwordStrength.fair", { defaultValue: "Fair" });
    color = "#F59E0B"; // yellow
  } else if (score === 4) {
    label = t("passwordStrength.good", { defaultValue: "Good" });
    color = "#3B82F6"; // blue
  } else {
    label = t("passwordStrength.strong", { defaultValue: "Strong" });
    color = "#10B981"; // green
  }

  // Smooth layout animation when expanding/collapsing criteria
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isFocused, hasValue, isStrong]);

  const RequirementItem = ({
    met,
    text,
  }: {
    met: boolean;
    text: string;
  }) => (
    <View className="flex-row items-center mt-1.5">
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={met ? "#10B981" : "#9CA3AF"}
        className="mr-2"
      />
      <Text
        className={`text-xs font-quicksandMedium ${
          met ? "text-emerald-600 dark:text-emerald-500" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <View>
      {/* Main Input Container */}
      <View
        className={`bg-white dark:bg-[#080A08] flex-row items-center px-4 py-1 border rounded-2xl ${
          isFocused ? "border-cyan-500 dark:border-cyan-600" : "border-gray-200 dark:border-[#2a2a2a]"
        }`}
      >
        {/* Lock Icon */}
        {hasIcon && (
          <MaterialIcons
            name="lock-outline"
            size={20}
            color={isFocused ? "#0e7490" : "#6B7280"}
            className="mr-2"
          />
        )}

        {/* Text Input */}
        <TextInput
          className="flex-1 py-2 text-gray-800 dark:text-gray-200 font-quicksandMedium"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />

        {/* Show/Hide Password Toggle */}
        <TouchableOpacity onPress={togglePassword} className="p-1">
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      {/* Clean Password Strength UI (Only shown when focused or has value) */}
      {showStrengthIndicator && (isFocused || hasValue) && (
        <View className="mt-3 px-1">
          {/* Strength Line & Label */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 h-1 bg-gray-200 dark:bg-[#1e1e1e] rounded-full overflow-hidden flex-row gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  className="h-full flex-1 rounded-full"
                  style={{
                    backgroundColor: score >= level ? color : "transparent",
                  }}
                />
              ))}
            </View>
            <Text
              className="text-[10px] font-quicksandBold uppercase ml-3 tracking-wider"
              style={{ color }}
            >
              {label}
            </Text>
          </View>

          {/* Requirements Checklist — collapses completely when strong to save space, but expands when focused if not strong */}
          {(!isStrong || isFocused) && (
            <View className="flex-row flex-wrap mt-1">
              <View className="w-1/2">
                <RequirementItem
                  met={checks.length}
                  text={t("passwordRequirements.length", { defaultValue: "8+ characters" })}
                />
                <RequirementItem
                  met={checks.uppercase}
                  text={t("passwordRequirements.uppercase", { defaultValue: "Uppercase letter" })}
                />
                <RequirementItem
                  met={checks.lowercase}
                  text={t("passwordRequirements.lowercase", { defaultValue: "Lowercase letter" })}
                />
              </View>
              <View className="w-1/2">
                <RequirementItem
                  met={checks.number}
                  text={t("passwordRequirements.number", { defaultValue: "Number" })}
                />
                <RequirementItem
                  met={checks.special}
                  text={t("passwordRequirements.special", { defaultValue: "Special character" })}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
