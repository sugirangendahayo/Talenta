// components/employer/ApplicantCard.tsx - IMPROVED VERSION
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import type { Applicant } from "@/types/job.types";

interface ApplicantCardProps {
  applicant: Applicant;
  onStatusUpdated: () => void;
}

export default function ApplicantCard({
  applicant,
  onStatusUpdated,
}: ApplicantCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const candidateName = `${applicant.jobseeker_profiles.first_name} ${applicant.jobseeker_profiles.last_name}`;
  const phone = applicant.jobseeker_profiles.phone;
  const email = applicant.jobseeker_profiles.email;

  // Status badge configuration
  const getStatusConfig = () => {
    switch (applicant.status) {
      case "hired":
        return {
          text: "Hired",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          icon: "checkmark-circle" as const,
        };
      case "shortlisted":
        return {
          text: "Shortlisted",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          icon: "star" as const,
        };
      case "rejected":
        return {
          text: "Rejected",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          icon: "close-circle" as const,
        };
      default:
        return {
          text: "Pending",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          icon: "time" as const,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Update application status
  const updateStatus = async (newStatus: Applicant["status"]) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicant.id);

      if (error) throw error;

      onStatusUpdated();
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Contact handlers
  const handleCall = () => {
    if (!phone) {
      Alert.alert(
        "No Phone Number",
        "This candidate hasn't provided a phone number.",
      );
      return;
    }
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    if (!phone) {
      Alert.alert(
        "No Phone Number",
        "This candidate hasn't provided a phone number.",
      );
      return;
    }
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    const message = `Hi ${candidateName}, I'm reaching out regarding your application for ${applicant.jobs.title}.`;

    const whatsappURL = Platform.select({
      ios: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      default: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
    });

    Linking.canOpenURL(whatsappURL!).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappURL!);
      } else {
        Alert.alert(
          "WhatsApp Not Installed",
          "Please install WhatsApp to use this feature.",
        );
      }
    });
  };

  const handleEmail = () => {
    const subject = `Regarding: ${applicant.jobs.title}`;
    const body = `Hi ${candidateName},\n\nI'm reaching out regarding your application for ${applicant.jobs.title}.\n\nBest regards`;
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const handleViewCV = () => {
    if (applicant.jobseeker_profiles.cv_document_url) {
      Linking.openURL(applicant.jobseeker_profiles.cv_document_url);
    } else {
      Alert.alert("No CV", "This candidate hasn't uploaded a CV.");
    }
  };

  const handleViewDetails = () => {
    router.push({
      pathname: "/(employer)/applicant-details",
      params: { applicationId: applicant.id },
    });
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
      {/* Header Section */}
      <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.7}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-quicksandBold text-gray-900">
              {candidateName}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 mt-0.5">
              {email}
            </Text>
            {phone && (
              <Text className="text-sm font-quicksandMedium text-gray-500 mt-0.5">
                {phone}
              </Text>
            )}
          </View>

          <View
            className={`${statusConfig.bgColor} px-3 py-1.5 rounded-full flex-row items-center gap-1`}
          >
            <Ionicons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.textColor.replace("text-", "#")}
            />
            <Text
              className={`${statusConfig.textColor} text-xs font-quicksandBold`}
            >
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Info Row */}
        <View className="flex-row items-center gap-4 mb-3">
          {applicant.jobseeker_profiles.experience_level && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
              <Text className="text-xs font-quicksandMedium text-gray-600">
                {applicant.jobseeker_profiles.experience_level}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-xs font-quicksandMedium text-gray-600">
              Applied {formatDate(applicant.created_at)}
            </Text>
          </View>
        </View>

        {/* Skills */}
        {applicant.jobseeker_profiles.skills &&
          applicant.jobseeker_profiles.skills.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {applicant.jobseeker_profiles.skills
                .slice(0, 3)
                .map((skill, index) => (
                  <View
                    key={index}
                    className="bg-cyan-50 px-2.5 py-1 rounded-full"
                  >
                    <Text className="text-xs font-quicksandMedium text-cyan-700">
                      {skill}
                    </Text>
                  </View>
                ))}
              {applicant.jobseeker_profiles.skills.length > 3 && (
                <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                  <Text className="text-xs font-quicksandMedium text-gray-600">
                    +{applicant.jobseeker_profiles.skills.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="border-t border-gray-100 pt-3">
        {/* Status Update Buttons - Only show if not hired */}
        {applicant.status !== "hired" && (
          <View className="flex-row gap-2 mb-3">
            {applicant.status !== "shortlisted" && (
              <TouchableOpacity
                onPress={() => updateStatus("shortlisted")}
                disabled={isUpdating}
                className="flex-1 bg-blue-50 py-2.5 rounded-lg border border-blue-200"
                activeOpacity={0.7}
              >
                <Text className="text-blue-700 text-xs font-quicksandBold text-center">
                  Shortlist
                </Text>
              </TouchableOpacity>
            )}
            {applicant.status !== "rejected" && (
              <TouchableOpacity
                onPress={() => updateStatus("rejected")}
                disabled={isUpdating}
                className="flex-1 bg-red-50 py-2.5 rounded-lg border border-red-200"
                activeOpacity={0.7}
              >
                <Text className="text-red-700 text-xs font-quicksandBold text-center">
                  Reject
                </Text>
              </TouchableOpacity>
            )}
            {applicant.status === "shortlisted" && (
              <TouchableOpacity
                onPress={() => updateStatus("hired")}
                disabled={isUpdating}
                className="flex-1 bg-green-50 py-2.5 rounded-lg border border-green-200"
                activeOpacity={0.7}
              >
                <Text className="text-green-700 text-xs font-quicksandBold text-center">
                  Hire
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contact Quick Actions - Only for hired candidates */}
        {applicant.status === "hired" && (
          <View className="mb-3">
            <Text className="text-xs font-quicksandBold text-gray-600 mb-2">
              Quick Contact
            </Text>
            <View className="flex-row gap-2">
              {phone && (
                <>
                  <TouchableOpacity
                    className="flex-1 bg-cyan-600 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5"
                    onPress={handleCall}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text className="text-xs font-quicksandBold text-white">
                      Call
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-green-600 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5"
                    onPress={handleWhatsApp}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text className="text-xs font-quicksandBold text-white">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                className={`${phone ? "flex-1" : "flex-1"} bg-purple-600 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5`}
                onPress={handleEmail}
                activeOpacity={0.7}
              >
                <Ionicons name="mail" size={16} color="#fff" />
                <Text className="text-xs font-quicksandBold text-white">
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Actions - View Details & CV */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleViewDetails}
            className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5"
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={16} color="#374151" />
            <Text className="text-gray-700 text-xs font-quicksandBold">
              View Details
            </Text>
          </TouchableOpacity>

          {applicant.jobseeker_profiles.cv_document_url && (
            <TouchableOpacity
              onPress={handleViewCV}
              className="flex-1 bg-cyan-50 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5 border border-cyan-200"
              activeOpacity={0.7}
            >
              <Ionicons name="document-outline" size={16} color="#0E7490" />
              <Text className="text-cyan-700 text-xs font-quicksandBold">
                View CV
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
