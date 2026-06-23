import CategorySelector from "@/components/employer/CategorySelector";
import ExpiryDatePicker from "@/components/employer/ExpiryDatePicker";
import FormInput from "@/components/employer/FormInput";
import JobTypeSelector from "@/components/employer/JobTypeSelector";
import PostJobHeader from "@/components/employer/PostJobHeader";
import SkillsInput from "@/components/employer/SkillsInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function PostJob() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation("jobs");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default expiry date: 30 days from now
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  };

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    category: "",
    type: [] as string[],
    description: "",
    requirements: [] as string[],
    skills: [] as string[],
    expiresAt: getDefaultExpiryDate(),
  });

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle job type selection
  const toggleJobType = (type: string) => {
    const types = formData.type.includes(type)
      ? formData.type.filter((t) => t !== type)
      : [...formData.type, type];
    updateField("type", types);
  };

  // Add skill/requirement
  const addToList = (field: "skills" | "requirements", item: string) => {
    updateField(field, [...formData[field], item]);
  };

  // Remove skill/requirement
  const removeFromList = (field: "skills" | "requirements", index: number) => {
    updateField(
      field,
      formData[field].filter((_, i) => i !== index),
    );
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) return t("validation.titleRequired");
    if (!formData.location.trim()) return t("validation.locationRequired");
    if (!formData.salaryMin.trim()) return t("validation.minSalaryRequired");
    if (!formData.salaryMax.trim()) return t("validation.maxSalaryRequired");

    // Validate salary numbers
    const minSalary = parseFloat(formData.salaryMin.replace(/[^0-9.-]+/g, ""));
    const maxSalary = parseFloat(formData.salaryMax.replace(/[^0-9.-]+/g, ""));

    if (isNaN(minSalary) || isNaN(maxSalary)) {
      return t("validation.validSalary");
    }

    if (minSalary >= maxSalary) {
      return t("validation.salaryRange");
    }

    if (!formData.category) return t("validation.categoryRequired");
    if (formData.type.length === 0) return t("validation.jobTypeRequired");
    if (!formData.description.trim())
      return t("validation.descriptionRequired");
    if (formData.requirements.length === 0)
      return t("validation.requirementsRequired");

    // Validate expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formData.expiresAt);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate <= today) {
      return t("validation.expiryDateFuture");
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert(t("messages.validationError"), error);
      return;
    }

    if (!user) {
      Alert.alert(t("messages.error"), t("messages.loginRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse salary values
      const minSalary = parseFloat(
        formData.salaryMin.replace(/[^0-9.-]+/g, ""),
      );
      const maxSalary = parseFloat(
        formData.salaryMax.replace(/[^0-9.-]+/g, ""),
      );

      // Format expiry date to YYYY-MM-DD
      const expiryDateString = formData.expiresAt.toISOString().split("T")[0];

      // Prepare job data
      const jobData = {
        employer_id: user.id,
        title: formData.title.trim(),
        location: formData.location.trim(),
        salary_min: minSalary,
        salary_max: maxSalary,
        job_type: formData.type.join(", "), // Store as comma-separated string
        category: formData.category,
        description: formData.description.trim(),
        experience_level: formData.requirements[0] || "", // First requirement as experience
        skills_required: formData.skills, // Store as array
        status: "active",
        expires_at: expiryDateString, // Add expiry date
      };

      // Insert job into database
      const { data, error: insertError } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Success!
      toast.success(t("messages.jobPosted"), {
        duration: 2000,
      });

      // Navigate back to dashboard
      setTimeout(() => {
        router.replace("/(employer-tabs)/employers/Jobs");
      }, 500);
    } catch (error: any) {
      console.error("Error posting job:", error);

      let errorMessage = t("messages.errorPosting");
      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t("messages.error"), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!user) {
      Alert.alert(t("messages.error"), t("messages.loginRequiredDraft"));
      return;
    }

    try {
      const minSalary = formData.salaryMin
        ? parseFloat(formData.salaryMin.replace(/[^0-9.-]+/g, ""))
        : 0;
      const maxSalary = formData.salaryMax
        ? parseFloat(formData.salaryMax.replace(/[^0-9.-]+/g, ""))
        : 0;

      // Format expiry date to YYYY-MM-DD
      const expiryDateString = formData.expiresAt.toISOString().split("T")[0];

      const draftData = {
        employer_id: user.id,
        title: formData.title.trim() || t("postJob.untitledJob"),
        location: formData.location.trim() || "",
        salary_min: minSalary,
        salary_max: maxSalary,
        job_type: formData.type.join(", "),
        category: formData.category || "it",
        description: formData.description.trim() || "",
        experience_level: formData.requirements[0] || "",
        skills_required: formData.skills,
        status: "draft",
        expires_at: expiryDateString,
      };

      const { error } = await supabase.from("jobs").insert(draftData);

      if (error) throw error;

      toast.success(t("messages.draftSaved"), {
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      Alert.alert(t("messages.error"), t("messages.errorSaving"));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <PostJobHeader onSaveDraft={handleSaveDraft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1"
        >
          <View className="px-4 py-4">
            {/* Section: Basic Information */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-cyan-100 rounded-full items-center justify-center flex">
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#0E7490"
                  />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                  {t("sections.basicInfo.title")}
                </Text>
              </View>

              <FormInput
                label={t("sections.basicInfo.jobTitle")}
                placeholder={t("sections.basicInfo.jobTitlePlaceholder")}
                value={formData.title}
                onChangeText={(text) => updateField("title", text)}
                icon="briefcase-outline"
                required
              />

              <FormInput
                label={t("sections.basicInfo.location")}
                placeholder={t("sections.basicInfo.locationPlaceholder")}
                value={formData.location}
                onChangeText={(text) => updateField("location", text)}
                icon="location-outline"
                required
              />

              <View className="mb-4">
                <View className="flex flex-row items-center mb-2 gap-1">
                  <Ionicons name="cash-outline" size={16} color="#0E7490" />
                  <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
                    {t("sections.basicInfo.salaryRange")}
                  </Text>
                  <Text className="text-red-500 font-quicksandBold">*</Text>
                </View>
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <FormInput
                      label=""
                      placeholder={t("sections.basicInfo.minSalary")}
                      value={formData.salaryMin}
                      onChangeText={(text) => updateField("salaryMin", text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      label=""
                      placeholder={t("sections.basicInfo.maxSalary")}
                      value={formData.salaryMax}
                      onChangeText={(text) => updateField("salaryMax", text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Expiry Date Picker */}
              <ExpiryDatePicker
                label={t("sections.basicInfo.expiryDate")}
                selectedDate={formData.expiresAt}
                onDateChange={(date) => updateField("expiresAt", date)}
                required
              />
            </View>

            {/* Section: Job Details */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center flex">
                  <Ionicons name="document-text" size={18} color="#8B5CF6" />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                  {t("sections.jobDetails.title")}
                </Text>
              </View>

              <CategorySelector
                label={t("sections.jobDetails.category")}
                selected={formData.category}
                onSelect={(cat) => updateField("category", cat)}
                required
              />

              <JobTypeSelector
                label={t("sections.jobDetails.jobType")}
                selected={formData.type}
                onSelect={toggleJobType}
                required
              />

              <FormInput
                label={t("sections.jobDetails.description")}
                placeholder={t("sections.jobDetails.descriptionPlaceholder")}
                value={formData.description}
                onChangeText={(text) => updateField("description", text)}
                icon="document-text-outline"
                multiline
                required
              />
            </View>

            {/* Section: Requirements & Skills */}
            <View className="mb-6">
              <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center flex">
                  <Ionicons name="checkmark-done" size={18} color="#10B981" />
                </View>
                <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                  {t("sections.requirementsAndSkills.title")}
                </Text>
              </View>

              <SkillsInput
                label={t("sections.requirements.title")}
                placeholder={t("sections.requirements.requirementsPlaceholder")}
                skills={formData.requirements}
                onAdd={(req) => addToList("requirements", req)}
                onRemove={(index) => removeFromList("requirements", index)}
                required
              />

              <SkillsInput
                label={t("sections.requirements.skills")}
                placeholder={t("sections.requirements.skillsPlaceholder")}
                skills={formData.skills}
                onAdd={(skill) => addToList("skills", skill)}
                onRemove={(index) => removeFromList("skills", index)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#080A08] border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-100 dark:bg-[#141414] py-3 rounded-xl items-center justify-center flex"
              disabled={isSubmitting}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-quicksandBold text-base">
                {t("postJob.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-cyan-700 dark:bg-cyan-800 py-3 rounded-xl items-center justify-center flex flex-row gap-2"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-quicksandBold text-base">
                    {t("postJob.postJob")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
