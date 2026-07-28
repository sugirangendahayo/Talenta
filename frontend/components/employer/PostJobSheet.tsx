// components/employer/PostJobSheet.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { EmployerProfile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import KeyboardWrapper from "@/components/common/KeyboardWrapper";
import { toast } from "sonner-native";

// Android needs this opted in explicitly per-app before LayoutAnimation will
// do anything; iOS has it enabled by default. Safe to call unconditionally.
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

// Structured experience ranges instead of forcing free-text ("3 years of experience").
// value is what actually gets stored — human-readable and consistent for filtering later.
const EXPERIENCE_LEVELS = [
  { id: "none", labelKey: "experience.none", value: "No experience required" },
  { id: "entry", labelKey: "experience.entry", value: "0–1 years" },
  { id: "junior", labelKey: "experience.junior", value: "1–3 years" },
  { id: "mid", labelKey: "experience.mid", value: "3–5 years" },
  { id: "senior", labelKey: "experience.senior", value: "5+ years" },
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
  /** When set, the sheet edits/resumes this existing job (typically a draft)
   * instead of creating a new one. Pass `null`/omit to create a new job. */
  editingJob?: any | null;
}

const emptyForm = () => ({
  title: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  category: "",
  typeKeys: [] as string[],
  description: "",
  experienceLevel: "" as string, // id from EXPERIENCE_LEVELS
  noRequirements: false,
  requirements: [] as string[],
  noSkills: false,
  skills: [] as string[],
  expiresAt: getDefaultExpiry(),
});

// Converts a DB job row (e.g. a saved draft) back into the sheet's form
// shape, so "Edit draft" can resume exactly where the employer left off.
const formFromJob = (job: any) => {
  const rawTypes: string[] = (job.job_type || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const typeKeys = rawTypes
    .map((val) => Object.keys(JOB_TYPE_VALUES).find((k) => JOB_TYPE_VALUES[k] === val))
    .filter((k): k is string => !!k);

  const experienceLevel =
    EXPERIENCE_LEVELS.find((e) => e.value === job.experience_level)?.id ?? "";

  const skills: string[] = Array.isArray(job.skills_required)
    ? job.skills_required
    : [];

  return {
    title: job.title || "",
    location: job.location || "",
    salaryMin: job.salary_min != null ? String(job.salary_min) : "",
    salaryMax: job.salary_max != null ? String(job.salary_max) : "",
    category: job.category || "",
    typeKeys,
    description: job.description || "",
    experienceLevel,
    noRequirements: false,
    requirements: [] as string[],
    noSkills: skills.length === 0,
    skills,
    expiresAt: job.expires_at ? new Date(job.expires_at) : getDefaultExpiry(),
  };
};

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
  onFocus,
  editable = true,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
  onFocus?: () => void;
  editable?: boolean;
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
      onFocus={onFocus}
      editable={editable}
      className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-sm font-quicksandMedium text-gray-800 dark:text-gray-100"
      style={[style, !editable && { opacity: 0.5 }]}
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
          : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
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
        <Ionicons
          name="close"
          size={12}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>
    </View>
  );
}

// A toggle row that flips a field like "no requirements needed" / "no specific skills".
// Placed above the tag input so the employer sees the opt-out before they start typing.
function NoneToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between px-4 py-3 rounded-xl border mb-3 ${
        value
          ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800"
          : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
      }`}
    >
      <Text
        className={`text-sm font-quicksandSemiBold flex-1 mr-3 ${
          value
            ? "text-cyan-800 dark:text-cyan-300"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {label}
      </Text>
      <View
        className={`w-11 h-6 rounded-full justify-center px-0.5 ${
          value ? "bg-cyan-700" : "bg-gray-300 dark:bg-gray-600"
        }`}
        style={{ alignItems: value ? "flex-end" : "flex-start" }}
      >
        <View className="w-5 h-5 rounded-full bg-white" />
      </View>
    </TouchableOpacity>
  );
}

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
  required,
  disabled,
  onFocus,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  required?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
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
      <FieldLabel required={required && !disabled}>{label}</FieldLabel>
      <StyledInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        editable={!disabled}
        onFocus={onFocus}
      />
      {/* Hint to confirm with Return key */}
      {!disabled && text.trim().length > 0 && (
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
      {!disabled && tags.length > 0 && (
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
  editingJob,
}: PostJobSheetProps) {
  const { user, profile } = useAuth();
  const { t } = useTranslation("jobs");
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  const employerProfile = profile as EmployerProfile | null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  // When opened to resume an existing draft, load its saved values into the
  // form. When opened fresh (no editingJob), make sure we start blank —
  // this also covers the case where the sheet is reused for a 2nd job right
  // after editing a draft.
  useEffect(() => {
    if (!visible) return;
    setStep(0);
    setForm(editingJob ? formFromJob(editingJob) : emptyForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingJob?.id]);

  // We use KeyboardWrapper to handle scroll offsets automatically.
  const scrollRef = useRef<any>(null); // Still need a ref for manual scrolling if needed

  // When a field is focused, nudge the ScrollView so the field sits above the
  // keyboard rather than trusting scroll-into-view timing, which is unreliable
  // the instant the keyboard starts animating in.
  const scrollFieldIntoView = (approxY: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: approxY, animated: true });
    }, 50);
  };

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
      if (!form.experienceLevel)
        return t("validation.experienceRequired", {
          defaultValue: "Select an experience level.",
        });
      // Requirements/skills are only mandatory if the employer hasn't opted
      // out via the "none needed" toggle.
      if (!form.noRequirements && form.requirements.length === 0)
        return t("validation.requirementsRequired", {
          defaultValue:
            "Add at least one requirement, or mark that none are needed.",
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

  const isEditing = !!editingJob;

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
    
    // Safety net: ensure profile is complete and business is verified
    if (!employerProfile?.profile_completed) {
      Alert.alert("Profile Incomplete", "Please complete your profile before posting jobs.");
      return;
    }
    
    if (employerProfile?.business_verification_status !== "approved") {
      Alert.alert("Verification Required", "Your business must be verified before posting jobs.");
      return;
    }
    
    setSubmitting(true);
    try {
      const min = parseFloat(form.salaryMin.replace(/[^0-9.]/g, "")) || 0;
      const max = parseFloat(form.salaryMax.replace(/[^0-9.]/g, "")) || 0;
      const expiry = form.expiresAt.toISOString().split("T")[0];
      const dbTypes = form.typeKeys.map((k) => JOB_TYPE_VALUES[k]).join(", ");
      const experienceValue =
        EXPERIENCE_LEVELS.find((e) => e.id === form.experienceLevel)?.value ??
        "";
      const jobPayload = {
        employer_id: user.id,
        title: form.title.trim() || "Untitled",
        location: form.location.trim(),
        salary_min: min,
        salary_max: max,
        job_type: dbTypes,
        category: form.category || "it",
        description: form.description.trim(),
        experience_level: experienceValue,
        skills_required: form.noSkills ? [] : form.skills,
        status: asDraft ? "draft" : "active",
        expires_at: expiry,
      };

      const { error } = isEditing
        ? await supabase
            .from("jobs")
            .update(jobPayload)
            .eq("id", editingJob.id)
        : await supabase.from("jobs").insert(jobPayload);
      if (error) throw error;
      toast.success(
        asDraft
          ? t("postJob.draftSaved", { defaultValue: "Draft saved." })
          : isEditing
            ? t("postJob.published", { defaultValue: "Job published!" })
            : t("postJob.posted", { defaultValue: "Job posted!" }),
        { duration: 2000 },
      );
      handleClose();
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : String(err);
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
          onFocus={() => scrollFieldIntoView(0)}
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
          onFocus={() => scrollFieldIntoView(80)}
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
              onFocus={() => scrollFieldIntoView(160)}
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
              onFocus={() => scrollFieldIntoView(160)}
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
          onFocus={() => scrollFieldIntoView(400)}
        />
      </FieldWrap>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Experience level — chip selector instead of free-text so employers
          aren't forced to phrase "3 years of experience" themselves, and so
          short/partial experience (a few months, a semester internship) has
          a natural home instead of being rounded up or typed awkwardly. */}
      <FieldWrap>
        <FieldLabel required>
          {t("postJob.fields.experience", {
            defaultValue: "Experience level",
          })}
        </FieldLabel>
        <View className="flex-row flex-wrap mt-1">
          {EXPERIENCE_LEVELS.map((lvl) => (
            <SelectChip
              key={lvl.id}
              label={t(lvl.labelKey, { defaultValue: lvl.value })}
              selected={form.experienceLevel === lvl.id}
              onPress={() => updateField("experienceLevel", lvl.id)}
            />
          ))}
        </View>
      </FieldWrap>

      {/* Requirements — with an explicit opt-out */}
      <View className="mb-1">
        <FieldLabel>
          {t("postJob.fields.requirements", {
            defaultValue: "Requirements",
          })}
        </FieldLabel>
      </View>
      <NoneToggle
        label={t("postJob.noRequirements", {
          defaultValue: "No specific requirements needed",
        })}
        value={form.noRequirements}
        onToggle={() => updateField("noRequirements", !form.noRequirements)}
      />
      {!form.noRequirements && (
        <TagInput
          label=""
          placeholder={t("postJob.placeholders.requirements", {
            defaultValue: "e.g. Valid driver's license, own laptop",
          })}
          tags={form.requirements}
          onAdd={(v) => updateField("requirements", [...form.requirements, v])}
          onRemove={(i) =>
            updateField(
              "requirements",
              form.requirements.filter((_, idx) => idx !== i),
            )
          }
          onFocus={() => scrollFieldIntoView(300)}
        />
      )}

      {/* Skills — with the same opt-out pattern */}
      <View className="mb-1">
        <FieldLabel>
          {t("postJob.fields.skills", { defaultValue: "Skills" })}
        </FieldLabel>
      </View>
      <NoneToggle
        label={t("postJob.noSkills", {
          defaultValue: "No specific skills required",
        })}
        value={form.noSkills}
        onToggle={() => updateField("noSkills", !form.noSkills)}
      />
      {!form.noSkills && (
        <TagInput
          label=""
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
          onFocus={() => scrollFieldIntoView(500)}
        />
      )}
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
        defaultValue: "Experience and what the ideal candidate brings",
      }),
    },
  ];

  const windowHeight = Dimensions.get("window").height;
  const sheetHeight = windowHeight * 0.93;

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
            backgroundColor: isDark ? "#080A08" : "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: sheetHeight,
            flexDirection: "column",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 20,
            elevation: 20,
          }}
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
            <View className="flex-1 pr-2">
              {isEditing && (
                <View className="flex-row items-center self-start bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full mb-1">
                  <Text className="text-[10px] font-quicksandBold text-blue-700 dark:text-blue-400">
                    {t("postJob.editingDraft", { defaultValue: "Editing draft" })}
                  </Text>
                </View>
              )}
              <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
                {STEP_META[step].title}
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
                {STEP_META[step].subtitle}
              </Text>
            </View>
            {/* Save-draft is also shown inline on step 0's footer, but once the
                employer has moved past step 0 there's no other way back to it
                short of tapping Back repeatedly — so surface it here too. */}
            {step > 0 && (
              <TouchableOpacity
                onPress={() => handleSubmit(true)}
                disabled={submitting}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-2 px-2 py-1.5"
              >
                <Text className="text-xs font-quicksandBold text-cyan-700 dark:text-cyan-400">
                  {isEditing
                    ? t("postJob.updateDraft", { defaultValue: "Update draft" })
                    : t("postJob.saveDraft", { defaultValue: "Save draft" })}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons name="close" size={17} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Scrollable body using KeyboardWrapper */}
          <View className="flex-1">
            <KeyboardWrapper
              bottomOffset={20}
              contentStyle={{
                paddingHorizontal: 24,
                paddingBottom: 28,
              }}
            >
              {step === 0 && renderStep0()}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
            </KeyboardWrapper>

            {/* Footer */}
            <View className="flex-row gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#0D0F0D]">
              {/* Left action: Draft (step 0) or Back */}
              {step === 0 ? (
                <TouchableOpacity
                  onPress={() => handleSubmit(true)}
                  disabled={submitting}
                  activeOpacity={0.7}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] items-center justify-center"
                >
                  <Text className="text-sm font-quicksandBold text-gray-500 dark:text-gray-400">
                    {isEditing
                      ? t("postJob.updateDraft", { defaultValue: "Update draft" })
                      : t("postJob.saveDraft", { defaultValue: "Save draft" })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleBack}
                  disabled={submitting}
                  activeOpacity={0.7}
                  className="w-14 h-12 rounded-xl border border-gray-200 dark:border-[#2a2a2a] items-center justify-center"
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
                      {isEditing
                        ? t("postJob.publishDraft", { defaultValue: "Publish job" })
                        : t("postJob.publish", { defaultValue: "Post job" })}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
