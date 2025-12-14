import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";

export default function EmployerProfile() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const settingsSections = [
    {
      title: "Company Account",
      icon: "business-outline",
      items: [
        { icon: "edit", label: "Edit Company Profile", type: "link" },
        { icon: "people", label: "Team Management", type: "link" },
        {
          icon: "verified-user",
          label: "Verification Status",
          value: "Verified",
          type: "link",
        },
        { icon: "lock", label: "Privacy & Security", type: "link" },
      ],
    },
    {
      title: "Hiring Preferences",
      icon: "settings-outline",
      items: [
        {
          icon: "notifications",
          label: "Application Alerts",
          type: "toggle",
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: "email",
          label: "Email Notifications",
          type: "toggle",
          value: emailUpdates,
          onValueChange: setEmailUpdates,
        },
        { icon: "filter-list", label: "Default Filters", type: "link" },
        { icon: "schedule", label: "Auto-Reply Settings", type: "link" },
      ],
    },
    {
      title: "Subscription & Billing",
      icon: "card-outline",
      items: [
        {
          icon: "workspace-premium",
          label: "Current Plan",
          value: "Business Pro",
          type: "link",
        },
        { icon: "payment", label: "Payment Method", type: "link" },
        { icon: "receipt-long", label: "Billing History", type: "link" },
        { icon: "upgrade", label: "Upgrade Plan", type: "link" },
      ],
    },
    {
      title: "Support & Resources",
      icon: "help-outline",
      items: [
        { icon: "support-agent", label: "Contact Support", type: "link" },
        { icon: "school", label: "Hiring Resources", type: "link" },
        { icon: "description", label: "Terms & Conditions", type: "link" },
        { icon: "privacy-tip", label: "Privacy Policy", type: "link" },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <Text className="text-3xl font-quicksandBold text-gray-800">
          Company Profile
        </Text>
        <Text className="text-gray-500 font-quicksandMedium mt-1">
          Manage your company account and settings
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Company Profile Card */}
        <View className="mx-6 my-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={{
                  uri: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
                }}
                className="w-20 h-20 rounded-2xl bg-gray-100 p-2"
                resizeMode="contain"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-2 border-2 border-white">
                <Feather name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-quicksandBold text-gray-800">
                TechCorp Inc.
              </Text>
              <Text className="text-gray-500 font-quicksandMedium mt-1">
                hr@techcorp.com
              </Text>
              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                <View className="bg-cyan-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                  <MaterialIcons name="verified" size={14} color="#0E7490" />
                  <Text className="text-cyan-700 text-xs font-quicksandBold">
                    Verified
                  </Text>
                </View>
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-700 text-xs font-quicksandBold">
                    Business Pro
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-2xl">
              <Ionicons name="qr-code-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Company Stats */}
          <View className="flex-row mt-6 pt-6 border-t border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                12
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                Active Jobs
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                156
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                Applicants
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                23
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                Hired
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-6 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
              <Ionicons name={section.icon} size={20} color="#0E7490" />
              <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
                {section.title}
              </Text>
            </View>

            {/* Section Items */}
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={item.type === "link" ? () => {} : undefined}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name={item.icon} size={22} color="#6B7280" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-800 font-quicksandMedium">
                      {item.label}
                    </Text>
                    {item.value && typeof item.value === "string" && (
                      <Text className="text-gray-500 text-sm font-quicksandMedium mt-1">
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>

                {item.type === "toggle" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: "#D1D5DB", true: "#0E7490" }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <View className="flex-row items-center">
                    {item.value && (
                      <Text className="text-gray-500 font-quicksandMedium mr-2">
                        {item.value}
                      </Text>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Quick Actions */}
        <View className="mx-6 mb-6 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
            <Ionicons name="flash-outline" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              Quick Actions
            </Text>
          </View>
          <View className="flex-row p-4">
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-cyan-100 p-3 rounded-2xl mb-2">
                <Ionicons name="add-circle-outline" size={24} color="#0E7490" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                Post Job
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-green-100 p-3 rounded-2xl mb-2">
                <Ionicons name="people-outline" size={24} color="#059669" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                Applicants
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-purple-100 p-3 rounded-2xl mb-2">
                <Ionicons
                  name="stats-chart-outline"
                  size={24}
                  color="#7C3AED"
                />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity className="mx-6 mb-8 bg-red-50 rounded-2xl p-4 flex-row items-center justify-center border border-red-200">
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-red-600 font-quicksandBold text-lg ml-2">
            Log Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 font-quicksandMedium text-sm">
            Talenta Employer v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
