// components/employer/PostJobSheet.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

const STEPS = 3;

const CATEGORIES = [
  { id: "it", labelKey: "category.it" },
  { id: "design", labelKey: "category.design" },
  { id: "business", labelKey: "category.business" },
  { id: "finance", labelKey: "category.finance" },
  { id: "healthcare", labelKey: "category.healthcare" },
  { id: "education", labelKey: "category.education" },
  { id: "sales", labelKey: "category.sales" },
  { id: "hospitality", labelKey: "category.hospitality" },
  { id: "transport", labelKey: "category.transport" },
  { id: "creative", labelKey: "category.creative" },
  { id: "construction", labelKey: "category.construction" },
  { id: "agriculture", labelKey: "category.agriculture" },
  { id: "security", labelKey: "category.security" },
];

const JOB_TYPE_KEYS = [
  "type.fullTime",
  "type.partTime",
  "type.contract",
  "type.freelance",
  "type.internship",
  "type.remote",
];

// Maps translation key → DB value
const JOB_TYPE_VALUES: Record<string, string> = {
  "type.fullTime": "Full-time",
  "type.partTime": "Part-time",
  "type.contract": "Contract",
  "type.freelance": "Freelance",
  "type.internship": "Internship",
  "type.remote": "Remote",
};

const EXPIRY_OPTIONS = [
  { labelKey: "expiry.30", days: 30 },
  { labelKey: "expiry.60", days: 60 },
  { labelKey: "expiry.90", days: 90 },
];

const getDefaultExpiry = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
};

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

interface PostJobSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = () => ({
  title: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  category: "",
  typeKeys: [] as string[],
  description: "",
  requirements: [] as string[],
  skills: [] as string[],
  expiresAt: getDefaultExpiry(),
});

// ─── Small atoms ────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Text className="text-xs font-quicksandSemiBold text-gray-500 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
      {children}
      {required && <Text className="text-cyan-700 dark:text-cyan-400"> *</Text>}
    </Text>
  );
}

function FieldWrap({ children }: { children: React.ReactNode }) {
  return <View className="mb-5">{children}</View>;
}

function StyledInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
  style,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType ?? "default"}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-quicksandMedium text-gray-800 dark:text-gray-100"
      style={style}
    />
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
        selected
          ? "bg-cyan-700 border-cyan-700"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <Text
        className={`text-xs font-quicksandSemiBold ${
          selected ? "text-white" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full pl-3 pr-2 py-1 mr-2 mb-2">
      <Text className="text-xs font-quicksandSemiBold text-gray-700 dark:text-gray-200 mr-1">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onRemove}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
      </TouchableOpacity>
    </View>
  );
}

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
  required,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  required?: boolean;
}) {
  const [text, setText] = useState("");

  const commit = () => {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setText("");
    }
  };

  return (
    <FieldWrap>
      <FieldLabel required={required}>{label}</FieldLabel>
      <StyledInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
      />
      {/* Hint to confirm with Return key */}
      {text.trim().length > 0 && (
        <View className="flex-row mt-2">
          <TouchableOpacity
            onPress={commit}
            activeOpacity={0.7}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="return-down-back" size={13} color="#0E7490" />
            <Text className="text-xs font-quicksandSemiBold text-cyan-700 dark:text-cyan-400">
              Add
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {tags.length > 0 && (
        <View className="flex-row flex-wrap mt-3">
          {tags.map((tag, i) => (
            <Tag key={i} label={tag} onRemove={() => onRemove(i)} />
          ))}
        </View>
      )}
    </FieldWrap>
  );
}

// ─── Step progress bar ───────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <View className="flex-row gap-1 px-6 py-3">
      {Array.from({ length: STEPS }).map((_, i) => (
        <View
          key={i}
          className={`h-0.5 flex-1 rounded-full ${
            i <= current
              ? "bg-cyan-700 dark:bg-cyan-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────

export default function PostJobSheet({
  visible,
  onClose,
  onSuccess,
}: PostJobSheetProps) {
  const { user } = useAuth();
  const { t } = useTranslation("jobs");
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTypeKey = (key: string) =>
    updateField(
      "typeKeys",
      form.typeKeys.includes(key)
        ? form.typeKeys.filter((k) => k !== key)
        : [...form.typeKeys, key],
    );

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.title.trim())
        return t("validation.titleRequired", {
          defaultValue: "Job title is required.",
        });
      if (!form.location.trim())
        return t("validation.locationRequired", {
          defaultValue: "Location is required.",
        });
      if (!form.salaryMin.trim())
        return t("validation.salaryMinRequired", {
          defaultValue: "Minimum salary is required.",
        });
      if (!form.salaryMax.trim())
        return t("validation.salaryMaxRequired", {
          defaultValue: "Maximum salary is required.",
        });
      const min = parseFloat(form.salaryMin.replace(/[^0-9.]/g, ""));
      const max = parseFloat(form.salaryMax.replace(/[^0-9.]/g, ""));
      if (isNaN(min) || isNaN(max))
        return t("validation.salaryInvalid", {
          defaultValue: "Enter valid salary numbers.",
        });
      if (min >= max)
        return t("validation.salaryOrder", {
          defaultValue: "Max salary must be greater than min.",
        });
    }
    if (step === 1) {
      if (!form.category)
        return t("validation.categoryRequired", {
          defaultValue: "Select a category.",
        });
      if (form.typeKeys.length === 0)
        return t("validation.typeRequired", {
          defaultValue: "Select at least one job type.",
        });
      if (!form.description.trim())
        return t("validation.descriptionRequired", {
          defaultValue: "Description is required.",
        });
    }
    if (step === 2) {
      if (form.requirements.length === 0)
        return t("validation.requirementsRequired", {
          defaultValue: "Add at least one requirement.",
        });
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      Alert.alert(
        t("validation.title", { defaultValue: "Check your inputs" }),
        err,
      );
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleClose = () => {
    setStep(0);
    setForm(emptyForm());
    onClose();
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft) {
      const err = validateStep();
      if (err) {
        Alert.alert(
          t("validation.title", { defaultValue: "Check your inputs" }),
          err,
        );
        return;
      }
    }
    if (!user) return;
    setSubmitting(true);
    try {
      const min = parseFloat(form.salaryMin.replace(/[^0-9.]/g, "")) || 0;
      const max = parseFloat(form.salaryMax.replace(/[^0-9.]/g, "")) || 0;
      const expiry = form.expiresAt.toISOString().split("T")[0];
      const dbTypes = form.typeKeys.map((k) => JOB_TYPE_VALUES[k]).join(", ");
      const { error } = await supabase.from("jobs").insert({
        employer_id: user.id,
        title: form.title.trim() || "Untitled",
        location: form.location.trim(),
        salary_min: min,
        salary_max: max,
        job_type: dbTypes,
        category: form.category || "it",
        description: form.description.trim(),
        experience_level: form.requirements[0] || "",
        skills_required: form.skills,
        status: asDraft ? "draft" : "active",
        expires_at: expiry,
      });
      if (error) throw error;
      toast.success(
        asDraft
          ? t("postJob.draftSaved", { defaultValue: "Draft saved." })
          : t("postJob.posted", { defaultValue: "Job posted!" }),
        { duration: 2000 },
      );
      handleClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert(
        t("error.title", { defaultValue: "Something went wrong" }),
        msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Drag-to-dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            handleClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  // ── Step renders ─────────────────────────────────────────────

  const renderStep0 = () => (
    <>
      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.title", { defaultValue: "Job title" })}
        </FieldLabel>
        <StyledInput
          value={form.title}
          onChangeText={(v) => updateField("title", v)}
          placeholder={t("postJob.placeholders.title", {
            defaultValue: "e.g. Senior React Developer",
          })}
        />
      </FieldWrap>

      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.location", { defaultValue: "Location" })}
        </FieldLabel>
        <StyledInput
          value={form.location}
          onChangeText={(v) => updateField("location", v)}
          placeholder={t("postJob.placeholders.location", {
            defaultValue: "e.g. Kigali / Remote",
          })}
        />
      </FieldWrap>

      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.salary", { defaultValue: "Monthly salary (USD)" })}
        </FieldLabel>
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <StyledInput
              value={form.salaryMin}
              onChangeText={(v) => updateField("salaryMin", v)}
              placeholder={t("postJob.placeholders.salaryMin", {
                defaultValue: "Min",
              })}
              keyboardType="numeric"
            />
          </View>
          <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
          <View className="flex-1">
            <StyledInput
              value={form.salaryMax}
              onChangeText={(v) => updateField("salaryMax", v)}
              placeholder={t("postJob.placeholders.salaryMax", {
                defaultValue: "Max",
              })}
              keyboardType="numeric"
            />
          </View>
        </View>
      </FieldWrap>

      <FieldWrap>
        <FieldLabel>
          {t("postJob.fields.expires", { defaultValue: "Listing duration" })}
        </FieldLabel>
        <View className="flex-row gap-2">
          {EXPIRY_OPTIONS.map(({ labelKey, days }) => {
            const target = addDays(days);
            const selected =
              form.expiresAt.toDateString() === target.toDateString();
            return (
              <TouchableOpacity
                key={days}
                onPress={() => updateField("expiresAt", target)}
                activeOpacity={0.7}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  selected
                    ? "bg-cyan-700 border-cyan-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-xs font-quicksandBold ${
                    selected ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t(labelKey, { defaultValue: `${days} days` })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </FieldWrap>
    </>
  );

  const renderStep1 = () => (
    <>
      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.category", { defaultValue: "Category" })}
        </FieldLabel>
        <View className="flex-row flex-wrap mt-1">
          {CATEGORIES.map((cat) => (
            <SelectChip
              key={cat.id}
              label={t(cat.labelKey, { defaultValue: cat.id })}
              selected={form.category === cat.id}
              onPress={() => updateField("category", cat.id)}
            />
          ))}
        </View>
      </FieldWrap>

      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.type", { defaultValue: "Job type" })}
        </FieldLabel>
        <View className="flex-row flex-wrap mt-1">
          {JOB_TYPE_KEYS.map((key) => (
            <SelectChip
              key={key}
              label={t(key, { defaultValue: JOB_TYPE_VALUES[key] })}
              selected={form.typeKeys.includes(key)}
              onPress={() => toggleTypeKey(key)}
            />
          ))}
        </View>
      </FieldWrap>

      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.description", { defaultValue: "Description" })}
        </FieldLabel>
        <StyledInput
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          placeholder={t("postJob.placeholders.description", {
            defaultValue:
              "Describe the role, day-to-day responsibilities, and what makes this opportunity unique…",
          })}
          multiline
          numberOfLines={6}
          style={{ minHeight: 130, paddingTop: 12 }}
        />
      </FieldWrap>
    </>
  );

  const renderStep2 = () => (
    <>
      <TagInput
        label={t("postJob.fields.requirements", {
          defaultValue: "Requirements",
        })}
        placeholder={t("postJob.placeholders.requirements", {
          defaultValue: "e.g. 3+ years experience",
        })}
        tags={form.requirements}
        onAdd={(v) => updateField("requirements", [...form.requirements, v])}
        onRemove={(i) =>
          updateField(
            "requirements",
            form.requirements.filter((_, idx) => idx !== i),
          )
        }
        required
      />

      <TagInput
        label={t("postJob.fields.skills", { defaultValue: "Skills" })}
        placeholder={t("postJob.placeholders.skills", {
          defaultValue: "e.g. React, Node.js, SQL",
        })}
        tags={form.skills}
        onAdd={(v) => updateField("skills", [...form.skills, v])}
        onRemove={(i) =>
          updateField(
            "skills",
            form.skills.filter((_, idx) => idx !== i),
          )
        }
      />
    </>
  );

  // ── Step meta (title + hint shown in header) ─────────────────

  const STEP_META = [
    {
      title: t("postJob.steps.basics.title", { defaultValue: "Basics" }),
      subtitle: t("postJob.steps.basics.subtitle", {
        defaultValue: "Title, location, salary",
      }),
    },
    {
      title: t("postJob.steps.details.title", { defaultValue: "Details" }),
      subtitle: t("postJob.steps.details.subtitle", {
        defaultValue: "Category, type, description",
      }),
    },
    {
      title: t("postJob.steps.requirements.title", {
        defaultValue: "Requirements",
      }),
      subtitle: t("postJob.steps.requirements.subtitle", {
        defaultValue: "What the ideal candidate brings",
      }),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          onPress={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: "93%",
            flexDirection: "column",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 20,
          }}
          className="bg-white dark:bg-gray-900"
        >
          {/* Drag handle + step bar */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-3 pb-1"
          >
            <View className="w-9 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          </View>

          <StepBar current={step} />

          {/* Sheet header */}
          <View className="flex-row items-center justify-between px-6 pb-4">
            <View>
              <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
                {STEP_META[step].title}
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
                {STEP_META[step].subtitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons name="close" size={17} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Scrollable body */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 0 && renderStep0()}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
            </ScrollView>

            {/* Footer */}
            <View className="flex-row gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              {/* Left action: Draft (step 0) or Back */}
              {step === 0 ? (
                <TouchableOpacity
                  onPress={() => handleSubmit(true)}
                  disabled={submitting}
                  activeOpacity={0.7}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center"
                >
                  <Text className="text-sm font-quicksandBold text-gray-500 dark:text-gray-400">
                    {t("postJob.saveDraft", { defaultValue: "Save draft" })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleBack}
                  disabled={submitting}
                  activeOpacity={0.7}
                  className="w-14 h-12 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center"
                >
                  <Ionicons name="arrow-back" size={18} color={iconColor} />
                </TouchableOpacity>
              )}

              {/* Right action: Continue or Post */}
              <TouchableOpacity
                onPress={
                  step < STEPS - 1 ? handleNext : () => handleSubmit(false)
                }
                disabled={submitting}
                activeOpacity={0.85}
                className="flex-1 py-3.5 rounded-xl bg-cyan-700 flex-row items-center justify-center gap-2"
                style={{ opacity: submitting ? 0.65 : 1 }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : step < STEPS - 1 ? (
                  <>
                    <Text className="text-sm font-quicksandBold text-white">
                      {t("postJob.continue", { defaultValue: "Continue" })}
                    </Text>
                    <Ionicons name="arrow-forward" size={15} color="#fff" />
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text className="text-sm font-quicksandBold text-white">
                      {t("postJob.publish", { defaultValue: "Post job" })}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
