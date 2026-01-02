import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

interface JobCardProps {
  title: string;
  salary: string;
  location: string;
  expiresIn?: string;
  daysActive?: string;
  applicants: number;
  messages: number;
}

const JobCard = ({
  title,
  salary,
  location,
  expiresIn,
  daysActive,
  applicants,
  messages,
}: JobCardProps) => (
  <View className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
    {/* Job Info */}
    <View className="mb-3">
      <Text className="text-base font-quicksandBold text-gray-800 mb-1">
        {title}
      </Text>
      <View className="flex flex-row items-center gap-3 flex-wrap">
        <View className="flex flex-row items-center gap-1">
          <Ionicons name="cash-outline" size={14} color="#10B981" />
          <Text className="text-xs font-quicksandMedium text-gray-600">
            {salary}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-1">
          <Ionicons name="location-outline" size={14} color="#0E7490" />
          <Text className="text-xs font-quicksandMedium text-gray-600">
            {location}
          </Text>
        </View>
        {expiresIn && (
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text className="text-xs font-quicksandMedium text-orange-600">
              {expiresIn}
            </Text>
          </View>
        )}
        {daysActive && (
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-xs font-quicksandMedium text-gray-600">
              {daysActive}
            </Text>
          </View>
        )}
      </View>
    </View>

    {/* Stats & Actions */}
    <View className="flex flex-row items-center justify-between pt-3 border-t border-gray-200">
      <View className="flex flex-row items-center gap-4">
        <View className="flex flex-row items-center gap-1">
          <Ionicons name="eye-outline" size={16} color="#0E7490" />
          <Text className="text-xs font-quicksandBold text-gray-700">
            {applicants} apps
          </Text>
        </View>
        <View className="flex flex-row items-center gap-1">
          <Ionicons name="chatbubble-outline" size={16} color="#8B5CF6" />
          <Text className="text-xs font-quicksandBold text-gray-700">
            {messages} messages
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-gray-200 px-3 py-1.5 rounded-full flex flex-row items-center gap-1"
        onPress={() => toast.success("Job paused")}
      >
        <Ionicons name="pause" size={14} color="#6B7280" />
        <Text className="text-xs font-quicksandBold text-gray-700">Pause</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ActiveJobsSection() {
  const jobs = [
    {
      title: "Senior React Developer",
      salary: "$120k",
      location: "Remote",
      expiresIn: "Expires in 3 days",
      applicants: 24,
      messages: 8,
    },
    {
      title: "UX Designer",
      salary: "$95k",
      location: "NYC",
      daysActive: "7 days active",
      applicants: 18,
      messages: 12,
    },
  ];

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-cyan-100 rounded-full items-center justify-center flex">
              <Ionicons name="briefcase" size={18} color="#0E7490" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                Active Jobs
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                5 positions open
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

        {/* Jobs List */}
        <View>
          {jobs.map((job, index) => (
            <JobCard key={index} {...job} />
          ))}
        </View>
      </View>
    </View>
  );
}
