import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
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

  return (
    <View>
      {/* Password Input */}
      <View className="relative">
        <TextInput
          className={`rounded-2xl px-4 py-3 pr-12 font-quicksandMedium bg-white ${
            hasIcon ? "pl-10" : ""
          }`}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
        <TouchableOpacity
          onPress={togglePassword}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            zIndex: 1,
          }}
        >
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && value.toString().length > 0 && (
        <View className="mt-3">
          {/* Strength Bar */}
          <View className="flex-row items-center gap-2 mb-2">
            <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(strength.score / 5) * 100}%`,
                  backgroundColor: strength.color,
                }}
              />
            </View>
            {strength.label && (
              <Text
                className="text-xs font-quicksandBold"
                style={{ color: strength.color }}
              >
                {strength.label}
              </Text>
            )}
          </View>

          {/* Requirements Checklist */}
          <View className="space-y-1">
            <RequirementItem
              label="At least 8 characters"
              met={strength.checks.length}
            />
            <RequirementItem
              label="Uppercase letter (A-Z)"
              met={strength.checks.uppercase}
            />
            <RequirementItem
              label="Lowercase letter (a-z)"
              met={strength.checks.lowercase}
            />
            <RequirementItem
              label="Number (0-9)"
              met={strength.checks.number}
            />
            <RequirementItem
              label="Special character (!@#$%^&*)"
              met={strength.checks.special}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#10B981" : "#9CA3AF"}
      />
      <Text
        className={`text-xs font-quicksandMedium ${
          met ? "text-green-700" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
