import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

interface RoleSelectorProps {
  role: "jobseeker" | "employer";
  onRoleChange: (role: "jobseeker" | "employer") => void;
}

export default function RoleSelector({
  role,
  onRoleChange,
}: RoleSelectorProps) {
  const { t } = useTranslation("auth");

  return (
    <View
      style={{
        backgroundColor: "#F9FAFB",
        zIndex: 10,
        paddingHorizontal: 24,
        paddingVertical: 8,
      }}
    >
      <View className="flex flex-row rounded-2xl bg-gray-100 dark:bg-[#141414]">
        {/* Job Seeker Button */}
        <TouchableOpacity
          onPress={() => onRoleChange("jobseeker")}
          className={`flex-1 flex flex-row justify-center items-center py-3 rounded-l-2xl ${
            role === "jobseeker" ? "bg-cyan-800" : ""
          }`}
        >
          <Text
            className={`font-quicksandBold ${
              role === "jobseeker" ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("signup.roles.jobseeker")}
          </Text>
        </TouchableOpacity>

        {/* Employer Button */}
        <TouchableOpacity
          onPress={() => onRoleChange("employer")}
          className={`flex-1 flex flex-row justify-center items-center py-3 rounded-r-2xl ${
            role === "employer" ? "bg-cyan-800" : ""
          }`}
        >
          <Text
            className={`font-quicksandBold ${
              role === "employer" ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("signup.roles.employer")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
