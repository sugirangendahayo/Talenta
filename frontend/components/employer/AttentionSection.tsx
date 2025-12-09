import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ApplicantItemProps {
  name: string;
  position: string;
  match: number;
  isNew?: boolean;
}

const ApplicantItem = ({
  name,
  position,
  match,
  isNew,
}: ApplicantItemProps) => (
  <TouchableOpacity className="flex flex-row items-center justify-between py-3 border-b border-gray-100">
    <View className="flex-1">
      <View className="flex flex-row items-center gap-2">
        <Text className="text-sm font-quicksandBold text-gray-800">{name}</Text>
        {isNew && (
          <View className="bg-red-500 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-quicksandBold text-white">NEW</Text>
          </View>
        )}
      </View>
      <Text className="text-xs font-quicksandMedium text-gray-500 mt-0.5">
        {position}
      </Text>
    </View>
    <View className="flex flex-row items-center gap-2">
      <View className="bg-green-100 px-2 py-1 rounded-full">
        <Text className="text-xs font-quicksandBold text-green-700">
          {match}% match
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
);

export default function AttentionSection() {
  const applicants = [
    {
      name: "John Doe",
      position: "Senior React Developer",
      match: 85,
      isNew: true,
    },
    { name: "Sarah Lee", position: "UX Designer", match: 92, isNew: true },
    {
      name: "Mike Chen",
      position: "Backend Developer",
      match: 78,
      isNew: true,
    },
  ];

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                Requiring Attention
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                3 high-priority applicants
              </Text>
            </View>
          </View>
          <TouchableOpacity className="flex flex-row items-center gap-1">
            <Text className="text-sm font-quicksandBold text-cyan-700">
              View All
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#0E7490" />
          </TouchableOpacity>
        </View>

        {/* Applicants List */}
        <View>
          {applicants.map((applicant, index) => (
            <ApplicantItem key={index} {...applicant} />
          ))}
        </View>
      </View>
    </View>
  );
}
