import { TextInput, TextInputProps } from "react-native";

interface TextFieldProps extends TextInputProps {
  hasIcon?: boolean;
}

export default function TextField({
  hasIcon = true,
  ...props
}: TextFieldProps) {
  return (
    <TextInput
      className={`rounded-2xl px-4 py-3 font-quicksandMedium text-gray-800 bg-white ${
        hasIcon ? "pl-10" : ""
      }`}
      {...props}
    />
  );
}
