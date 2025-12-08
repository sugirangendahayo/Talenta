import { View, Text, TouchableOpacity } from "react-native";

interface RoleSelectorProps {
  role: "jobseeker" | "employer";
  onRoleChange: (role: "jobseeker" | "employer") => void;
}

export default function RoleSelector({
  role,
  onRoleChange,
}: RoleSelectorProps) {
  return (
    <View
      style={{
        backgroundColor: "#F9FAFB",
        zIndex: 10,
        paddingHorizontal: 24,
        paddingVertical: 8,
      }}
    >
      <View className="flex flex-row rounded-2xl bg-gray-100">
        <TouchableOpacity
          onPress={() => onRoleChange("jobseeker")}
          className={`flex-1 flex flex-row justify-center items-center py-3 rounded-l-2xl${
            role === "jobseeker" ? " border-r border-cyan-700" : ""
          }`}
        >
          <Text
            className={`font-quicksandBold ${
              role === "jobseeker" ? "text-cyan-700" : "text-gray-700"
            }`}
          >
            Job Seeker
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onRoleChange("employer")}
          className={`flex-1 flex flex-row justify-center items-center py-3 rounded-r-2xl${
            role === "employer" ? "bg-white border-l-[1px] border-cyan-700" : ""
          }`}
        >
          <Text
            className={`font-quicksandBold ${
              role === "employer" ? "text-cyan-700" : "text-gray-700"
            }`}
          >
            Employer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
