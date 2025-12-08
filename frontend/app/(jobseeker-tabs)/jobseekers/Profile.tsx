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

export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const settingsSections = [
    {
      title: "Account",
      icon: "person-outline",
      items: [
        { icon: "edit", label: "Edit Profile", type: "link" },
        { icon: "lock", label: "Privacy & Security", type: "link" },
        { icon: "language", label: "Language", value: "English", type: "link" },
        {
          icon: "notifications",
          label: "Notifications",
          type: "toggle",
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    {
      title: "Preferences",
      icon: "settings-outline",
      items: [
        {
          icon: "dark-mode",
          label: "Dark Mode",
          type: "toggle",
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          icon: "email",
          label: "Email Updates",
          type: "toggle",
          value: emailUpdates,
          onValueChange: setEmailUpdates,
        },
        { icon: "visibility", label: "Appearance", type: "link" },
        {
          icon: "storage",
          label: "Storage",
          value: "2.3 GB used",
          type: "link",
        },
      ],
    },
    {
      title: "Support",
      icon: "help-outline",
      items: [
        { icon: "help-center", label: "Help & Support", type: "link" },
        { icon: "description", label: "Terms & Conditions", type: "link" },
        { icon: "privacy-tip", label: "Privacy Policy", type: "link" },
        { icon: "info", label: "About", type: "link" },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <Text className="text-3xl font-quicksandBold text-gray-800">
          Settings
        </Text>
        <Text className="text-gray-500 font-quicksandMedium mt-1">
          Manage your account preferences
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="mx-6 my-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                }}
                className="w-20 h-20 rounded-full"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-2 border-2 border-white">
                <Feather name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-quicksandBold text-gray-800">
                John Doe
              </Text>
              <Text className="text-gray-500 font-quicksandMedium mt-1">
                john.doe@example.com
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-quicksandBold">
                    Premium Member
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-2xl">
              <Ionicons name="qr-code-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
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
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#0E7490"
                />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                My Resume
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-green-100 p-3 rounded-2xl mb-2">
                <Ionicons name="briefcase-outline" size={24} color="#059669" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                Applications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-purple-100 p-3 rounded-2xl mb-2">
                <Ionicons name="heart-outline" size={24} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                Saved Jobs
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
            Talenta v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
