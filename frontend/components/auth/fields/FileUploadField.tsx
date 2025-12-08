import { TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="border-2 border-dashed border-gray-300 rounded-2xl p-4 items-center"
    >
      <MaterialIcons name="cloud-upload" size={24} color="#6B7280" />
      <Text className="text-gray-600 font-quicksandMedium mt-2 text-center">
        {isUploaded ? "File Uploaded" : placeholder}
      </Text>
    </TouchableOpacity>
  );
}
