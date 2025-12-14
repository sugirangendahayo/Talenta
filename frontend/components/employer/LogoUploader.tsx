import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface LogoUploaderProps {
  label: string;
  logoUrl: string;
  onUpload: () => void;
  onRemove: () => void;
  required?: boolean;
}

export default function LogoUploader({
  label,
  logoUrl,
  onUpload,
  onRemove,
  required = false,
}: LogoUploaderProps) {
  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="image-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>

      {/* Upload Area */}
      <View className="flex flex-row items-center gap-3">
        {/* Logo Preview */}
        <View className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center flex overflow-hidden">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          )}
        </View>

        {/* Upload/Remove Buttons */}
        <View className="flex-1 gap-2">
          <TouchableOpacity
            onPress={onUpload}
            className="bg-cyan-700 py-2 px-4 rounded-xl flex flex-row items-center justify-center gap-2"
          >
            <Ionicons name="cloud-upload-outline" size={18} color="white" />
            <Text className="text-white font-quicksandBold text-sm">
              {logoUrl ? "Change Logo" : "Upload Logo"}
            </Text>
          </TouchableOpacity>

          {logoUrl && (
            <TouchableOpacity
              onPress={onRemove}
              className="bg-red-100 py-2 px-4 rounded-xl flex flex-row items-center justify-center gap-2"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-red-600 font-quicksandBold text-sm">
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text className="text-xs font-quicksandMedium text-gray-500 mt-2">
        Recommended: Square image, PNG or JPG, max 2MB
      </Text>
    </View>
  );
}
