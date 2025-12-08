import { View, Text } from "react-native";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const percentage = Math.round((step / totalSteps) * 100);

  return (
    <View className="mb-6 mt-4">
      <View className="flex flex-row items-center justify-between mb-2">
        <Text className="text-gray-600 font-quicksandMedium">
          Step {step} of {totalSteps}
        </Text>
        <Text className="text-cyan-700 font-quicksandBold">{percentage}%</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full">
        <View
          className="h-2 bg-cyan-700 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
