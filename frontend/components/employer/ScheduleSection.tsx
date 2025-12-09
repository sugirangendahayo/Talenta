import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScheduleItemProps {
  time: string;
  type: "interview" | "call" | "review";
  title: string;
  candidate?: string;
}

const ScheduleItem = ({ time, type, title, candidate }: ScheduleItemProps) => {
  const typeConfig = {
    interview: { icon: "people", color: "#0E7490", bg: "#0E749015" },
    call: { icon: "call", color: "#10B981", bg: "#10B98115" },
    review: { icon: "document-text", color: "#F59E0B", bg: "#F59E0B15" },
  };

  const config = typeConfig[type];

  return (
    <TouchableOpacity className="flex flex-row items-start py-3 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: config.bg }}
      >
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>
      <View className="flex-1">
        <View className="flex flex-row items-center gap-2 mb-1">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-xs font-quicksandBold text-gray-600">
            {time}
          </Text>
        </View>
        <Text className="text-sm font-quicksandBold text-gray-800">
          {title}
        </Text>
        {candidate && (
          <Text className="text-xs font-quicksandMedium text-gray-500 mt-0.5">
            with {candidate}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

export default function ScheduleSection() {
  const schedule = [
    {
      time: "10:00 AM",
      type: "interview" as const,
      title: "Technical Interview",
      candidate: "Alex Johnson",
    },
    {
      time: "2:30 PM",
      type: "call" as const,
      title: "Follow-up Call",
      candidate: "Jane Smith",
    },
    {
      time: "4:00 PM",
      type: "review" as const,
      title: "Review new applications",
    },
  ];

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
              <Ionicons name="calendar" size={18} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                Today&apos;s Schedule
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                {schedule.length} events planned
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-cyan-700 rounded-full p-1.5">
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Schedule List */}
        <View>
          {schedule.map((item, index) => (
            <ScheduleItem key={index} {...item} />
          ))}
        </View>
      </View>
    </View>
  );
}
