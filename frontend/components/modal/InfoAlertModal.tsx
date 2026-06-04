import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void ;
}

export default function InfoAlertModal({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-6 max-h-[75%]">
          {/* Header here!*/}
          <View className="flex-row items-center mb-4">
            <Ionicons
              name="alert-circle"
              size={26}
              color="#DC2626"
              className="mr-2"
            />
            <Text className="text-xl font-quicksandBold text-gray-800 flex-1">
              {title}
            </Text>
          </View>

          {/* Message */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-gray-600 font-quicksandMedium leading-6">
              {message}
            </Text>
          </ScrollView>

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-cyan-700 py-4 rounded-2xl"
          >
            <Text className="text-white text-center font-quicksandBold text-lg">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
