import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

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
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Use external state if provided, otherwise use internal state
  const showPassword =
    externalShowPassword !== undefined
      ? externalShowPassword
      : internalShowPassword;
  const togglePassword =
    onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

  const [strength, setStrength] = useState<{
    score: number;
    label: string;
    color: string;
    checks: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
  }>({
    score: 0,
    label: "",
    color: "#D1D5DB",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  useEffect(() => {
    if (showStrengthIndicator && value) {
      const password = value.toString();
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
      };

      const score = Object.values(checks).filter(Boolean).length;

      let label = "";
      let color = "#D1D5DB";

      if (score === 0) {
        label = "";
        color = "#D1D5DB";
      } else if (score <= 2) {
        label = "Weak";
        color = "#EF4444";
      } else if (score === 3) {
        label = "Fair";
        color = "#F59E0B";
      } else if (score === 4) {
        label = "Good";
        color = "#3B82F6";
      } else {
        label = "Strong";
        color = "#10B981";
      }

      setStrength({ score, label, color, checks });
    }
  }, [value, showStrengthIndicator]);

  // Determine which requirements are missing (for compact display)
  const missingRequirements = [];
  if (value && showStrengthIndicator) {
    if (!strength.checks.length) missingRequirements.push("8+ chars");
    if (!strength.checks.uppercase) missingRequirements.push("A-Z");
    if (!strength.checks.lowercase) missingRequirements.push("a-z");
    if (!strength.checks.number) missingRequirements.push("0-9");
    if (!strength.checks.special) missingRequirements.push("!@#");
  }

  return (
    <View>
      {/* Main Input Container with Integrated Feedback */}
      <View className="bg-white rounded-2xl">
        {/* Input Row */}
        <View
          className={`flex-row items-center px-4 border ${
            showStrengthIndicator && value && value.toString().length > 0
              ? "rounded-t-2xl border-b-0"
              : "rounded-2xl border-gray-200"
          } ${isFocused ? "border-gray-200" : "border-gray-200"}`}
        >
          {/* Lock Icon */}
          {hasIcon && (
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={isFocused ? "#3B82F6" : "#6B7280"}
              className="mr-2"
            />
          )}

          {/* Text Input */}
          <TextInput
            className={`flex-1 py-3 text-gray-800 ${showPassword ? "font-quicksandMedium" : ""} ${hasIcon ? "" : ""}`}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor="#9CA3AF"
            {...props}
          />

          {/* Strength Status Icon (Compact) */}
          {showStrengthIndicator && value && value.toString().length > 0 && (
            <View className="mx-2">
              {strength.score >= 4 ? (
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
              ) : strength.score >= 2 ? (
                <MaterialIcons name="info" size={18} color="#F59E0B" />
              ) : (
                <MaterialIcons name="warning" size={18} color="#EF4444" />
              )}
            </View>
          )}

          {/* Show/Hide Password Toggle */}
          <TouchableOpacity onPress={togglePassword}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Strength Feedback Section (Only shows when typing) */}
        {showStrengthIndicator && value && value.toString().length > 0 && (
          <View
            className={`px-4 border border-t-0 rounded-b-2xl ${
              isFocused ? "border-gray-200 border-t-0" : "border-gray-200"
            }`}
          >
            {/* Strength Bar with Label */}
            <View className="flex-row items-center py-2">
              <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 5) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </View>
              <Text
                className="text-xs font-quicksandBold ml-2"
                style={{ color: strength.color }}
              >
                {strength.label}
              </Text>
            </View>

            {/* Compact Missing Requirements (only show if password is weak) */}
            {strength.score < 3 && missingRequirements.length > 0 && (
              <View className="pb-2">
                <Text className="text-xs text-gray-600 mb-1">
                  Add: {missingRequirements.join(", ")}
                </Text>

                {/* Visual Progress Dots */}
                <View className="flex-row space-x-1 mt-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <View
                      key={index}
                      className={`flex-1 h-1 rounded-full ${
                        index < strength.score
                          ? index < 2
                            ? "bg-red-500"
                            : index < 3
                              ? "bg-yellow-500"
                              : index < 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>


   
    </View>
  );
}


