import { TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  showPassword: boolean;
  onTogglePassword: () => void;
  hasIcon?: boolean;
}

export default function PasswordField({
  showPassword,
  onTogglePassword,
  hasIcon = true,
  ...props
}: PasswordFieldProps) {
  return (
    <>
      <TextInput
        className={`rounded-2xl px-4 py-3 pr-12 font-quicksandMedium bg-white ${
          hasIcon ? "pl-10" : ""
        }`}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        {...props}
      />
      <TouchableOpacity
        onPress={onTogglePassword}
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
    </>
  );
}
