// components/employer/ExpiryDatePicker.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface ExpiryDatePickerProps {
  label: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  required?: boolean;
}

export default function ExpiryDatePicker({
  label,
  selectedDate,
  onDateChange,
  required = false,
}: ExpiryDatePickerProps) {
  const { t } = useTranslation("jobs");
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (date) {
      onDateChange(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry(selectedDate);

  // Quick select options (7, 14, 30, 60, 90 days)
  const quickOptions = [
    { label: t("postJob.quickOptions.7days"), days: 7 },
    { label: t("postJob.quickOptions.14days"), days: 14 },
    { label: t("postJob.quickOptions.30days"), days: 30 },
    { label: t("postJob.quickOptions.60days"), days: 60 },
    { label: t("postJob.quickOptions.90days"), days: 90 },
  ];

  const handleQuickSelect = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="calendar-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>

      {/* Quick Select Buttons */}
      <View className="flex flex-row flex-wrap gap-2 mb-3">
        {quickOptions.map((option) => (
          <TouchableOpacity
            key={option.days}
            onPress={() => handleQuickSelect(option.days)}
            className={`px-3 py-2 rounded-lg border ${
              daysLeft === option.days
                ? "bg-cyan-700 border-cyan-700"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`text-xs font-quicksandBold ${
                daysLeft === option.days ? "text-white" : "text-gray-700"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Date Display */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-300"
      >
        <View className="flex-1">
          <Text className="text-gray-900 font-quicksandBold text-base mb-1">
            {formatDate(selectedDate)}
          </Text>
          <View className="flex flex-row items-center gap-2">
            <View
              className={`px-2 py-1 rounded-full ${
                daysLeft < 7
                  ? "bg-red-100"
                  : daysLeft < 30
                    ? "bg-yellow-100"
                    : "bg-green-100"
              }`}
            >
              <Text
                className={`text-xs font-quicksandBold ${
                  daysLeft < 7
                    ? "text-red-700"
                    : daysLeft < 30
                      ? "text-yellow-700"
                      : "text-green-700"
                }`}
              >
                {daysLeft} days active
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Info */}
      <View className="mt-2 flex flex-row items-start gap-2">
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text className="flex-1 text-xs font-quicksandMedium text-gray-500">
          {t("postJob.expiryInfo")}
        </Text>
      </View>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()} // Can't select past dates
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Max 1 year
        />
      )}
    </View>
  );
}
