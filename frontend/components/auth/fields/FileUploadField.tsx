import { TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface FileUploadFieldProps {
  placeholder: string;
  isUploaded: boolean;
  onPress: () => void;
}

export default function FileUploadField({
  placeholder,
  isUploaded,
  onPress,
}: FileUploadFieldProps) {
  const { t } = useTranslation("auth");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="border-2 border-dashed border-gray-300 rounded-2xl p-4 items-center"
    >
      <MaterialIcons name="cloud-upload" size={24} color="#6B7280" />
      <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium mt-2 text-center">
        {isUploaded ? t("fields.fileUploaded") : placeholder}
      </Text>
    </TouchableOpacity>
  );
}
