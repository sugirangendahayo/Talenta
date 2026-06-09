  // components/employer/PostJobSheet.tsx

  import { useAuth } from "@/contexts/AuthContext";
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
    StyleSheet,
  } from "react-native";
  import { toast } from "sonner-native";

  const STEPS = 3;

  const CATEGORIES = [
    { id: "it", label: "IT & Software" },
    { id: "design", label: "Design" },
    { id: "business", label: "Business" },
    { id: "finance", label: "Finance" },
    { id: "healthcare", label: "Healthcare" },
    { id: "education", label: "Education" },
    { id: "sales", label: "Sales & Marketing" },
    { id: "hospitality", label: "Hospitality" },
    { id: "transport", label: "Transport" },
    { id: "creative", label: "Creative" },
    { id: "construction", label: "Construction" },
    { id: "agriculture", label: "Agriculture" },
    { id: "security", label: "Security & Law" },
  ];

  const JOB_TYPES = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
    "Remote",
  ];

  const getDefaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <Text
      style={{
        fontSize: 12,
        fontFamily: "Quicksand_600SemiBold",
        color: "#374151",
        marginBottom: 6,
        letterSpacing: 0.1,
      }}
    >
      {text}
      {required && <Text style={{ color: "#0E7490" }}> *</Text>}
    </Text>
  );

  const Field = ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: any;
  }) => <View style={[{ marginBottom: 18 }, style]}>{children}</View>;

  const inputStyle = {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Quicksand_500Medium",
    color: "#111827",
  };

  const StepDots = ({ current }: { current: number }) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {Array.from({ length: STEPS }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor:
              i === current ? "#0E7490" : i < current ? "#67E8F9" : "#E5E7EB",
          }}
        />
      ))}
    </View>
  );

  const Chip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: selected ? "#0E7490" : "#E5E7EB",
        backgroundColor: selected ? "#ECFEFF" : "#fff",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Quicksand_600SemiBold",
          color: selected ? "#0E7490" : "#6B7280",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TagInput = ({
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
  }) => {
    const [text, setText] = useState("");

    const commit = () => {
      const trimmed = text.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        setText("");
      }
    };

    return (
      <Field>
        <Label text={label} required={required} />
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: tags.length > 0 ? 10 : 0,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={commit}
            style={[inputStyle, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={commit}
            activeOpacity={0.85}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#0E7490",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#F0FDFA",
                  borderWidth: 1,
                  borderColor: "#99F6E4",
                  borderRadius: 999,
                  paddingLeft: 10,
                  paddingRight: 6,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Quicksand_600SemiBold",
                    color: "#0F766E",
                  }}
                >
                  {tag}
                </Text>
                <TouchableOpacity onPress={() => onRemove(i)} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={15} color="#5EEAD4" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Field>
    );
  };

  const SectionHeading = ({
    icon,
    title,
    subtitle,
    iconBg,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    iconBg: string;
  }) => (
    <View style={{ marginBottom: 22 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon as any} size={16} color="#0E7490" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Quicksand_700Bold",
            color: "#111827",
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Quicksand_500Medium",
          color: "#9CA3AF",
          paddingLeft: 42,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );

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
    types: [] as string[],
    description: "",
    requirements: [] as string[],
    skills: [] as string[],
    expiresAt: getDefaultExpiry(),
  });

  export default function PostJobSheet({
    visible,
    onClose,
    onSuccess,
  }: PostJobSheetProps) {
    const { user } = useAuth();
    const { t } = useTranslation("jobs");

    const [step, setStep] = useState(0);
    const [form, setForm] = useState(emptyForm());
    const [submitting, setSubmitting] = useState(false);

    const updateField = (key: string, value: any) =>
      setForm((prev) => ({ ...prev, [key]: value }));

    const toggleType = (type: string) =>
      updateField(
        "types",
        form.types.includes(type)
          ? form.types.filter((t) => t !== type)
          : [...form.types, type]
      );

    const validateStep = (): string | null => {
      if (step === 0) {
        if (!form.title.trim()) return "Job title is required.";
        if (!form.location.trim()) return "Location is required.";
        if (!form.salaryMin.trim()) return "Minimum salary is required.";
        if (!form.salaryMax.trim()) return "Maximum salary is required.";
        const min = parseFloat(form.salaryMin.replace(/[^0-9.]/g, ""));
        const max = parseFloat(form.salaryMax.replace(/[^0-9.]/g, ""));
        if (isNaN(min) || isNaN(max)) return "Enter valid salary numbers.";
        if (min >= max) return "Max salary must be greater than min.";
      }
      if (step === 1) {
        if (!form.category) return "Select a category.";
        if (form.types.length === 0) return "Select at least one job type.";
        if (!form.description.trim()) return "Description is required.";
      }
      if (step === 2) {
        if (form.requirements.length === 0) return "Add at least one requirement.";
      }
      return null;
    };

    const handleNext = () => {
      const err = validateStep();
      if (err) { Alert.alert("Check your inputs", err); return; }
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
        if (err) { Alert.alert("Check your inputs", err); return; }
      }
      if (!user) return;
      setSubmitting(true);
      try {
        const min = parseFloat(form.salaryMin.replace(/[^0-9.]/g, "")) || 0;
        const max = parseFloat(form.salaryMax.replace(/[^0-9.]/g, "")) || 0;
        const expiry = form.expiresAt.toISOString().split("T")[0];
        const { error } = await supabase.from("jobs").insert({
          employer_id: user.id,
          title: form.title.trim() || "Untitled",
          location: form.location.trim(),
          salary_min: min,
          salary_max: max,
          job_type: form.types.join(", "),
          category: form.category || "it",
          description: form.description.trim(),
          experience_level: form.requirements[0] || "",
          skills_required: form.skills,
          status: asDraft ? "draft" : "active",
          expires_at: expiry,
        });
        if (error) throw error;
        toast.success(asDraft ? "Draft saved." : "Job posted successfully!", { duration: 2000 });
        handleClose();
        onSuccess();
      } catch (err: any) {
        Alert.alert("Error", err.message || "Something went wrong.");
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
      })
    ).current;

    const renderStep0 = () => (
      <>
        <SectionHeading
          icon="briefcase-outline"
          title="Basic Information"
          subtitle="The essentials jobseekers see first"
          iconBg="#ECFEFF"
        />
        <Field>
          <Label text="Job Title" required />
          <TextInput
            value={form.title}
            onChangeText={(v) => updateField("title", v)}
            placeholder="e.g. Senior React Developer"
            placeholderTextColor="#9CA3AF"
            style={inputStyle}
          />
        </Field>
        <Field>
          <Label text="Location" required />
          <TextInput
            value={form.location}
            onChangeText={(v) => updateField("location", v)}
            placeholder="e.g. Kigali, Rwanda / Remote"
            placeholderTextColor="#9CA3AF"
            style={inputStyle}
          />
        </Field>
        <Field>
          <Label text="Salary Range (USD)" required />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={form.salaryMin}
                onChangeText={(v) => updateField("salaryMin", v)}
                placeholder="Min  e.g. 500"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
            <View style={{ alignSelf: "center", width: 16, height: 1.5, backgroundColor: "#D1D5DB" }} />
            <View style={{ flex: 1 }}>
              <TextInput
                value={form.salaryMax}
                onChangeText={(v) => updateField("salaryMax", v)}
                placeholder="Max  e.g. 1500"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
          </View>
        </Field>
        <Field>
          <Label text="Listing expires" required />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[{ label: "30 days", days: 30 }, { label: "60 days", days: 60 }, { label: "90 days", days: 90 }].map(
              ({ label, days }) => {
                const target = new Date();
                target.setDate(target.getDate() + days);
                const selected = form.expiresAt.toDateString() === target.toDateString();
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => updateField("expiresAt", target)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: selected ? "#0E7490" : "#E5E7EB",
                      backgroundColor: selected ? "#ECFEFF" : "#F8FAFC",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: "Quicksand_700Bold", color: selected ? "#0E7490" : "#6B7280" }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </Field>
      </>
    );

    const renderStep1 = () => (
      <>
        <SectionHeading
          icon="document-text-outline"
          title="Job Details"
          subtitle="Help candidates understand the role"
          iconBg="#F5F3FF"
        />
        <Field>
          <Label text="Category" required />
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                selected={form.category === cat.id}
                onPress={() => updateField("category", cat.id)}
              />
            ))}
          </View>
        </Field>
        <Field>
          <Label text="Job Type" required />
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {JOB_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={form.types.includes(type)}
                onPress={() => toggleType(type)}
              />
            ))}
          </View>
        </Field>
        <Field>
          <Label text="Description" required />
          <TextInput
            value={form.description}
            onChangeText={(v) => updateField("description", v)}
            placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[inputStyle, { minHeight: 120, paddingTop: 12 }]}
          />
        </Field>
      </>
    );

    const renderStep2 = () => (
      <>
        <SectionHeading
          icon="checkmark-done-outline"
          title="Requirements & Skills"
          subtitle="What the ideal candidate brings"
          iconBg="#F0FDF4"
        />
        <TagInput
          label="Requirements"
          placeholder="e.g. 3+ years experience"
          tags={form.requirements}
          onAdd={(v) => updateField("requirements", [...form.requirements, v])}
          onRemove={(i) => updateField("requirements", form.requirements.filter((_, idx) => idx !== i))}
          required
        />
        <TagInput
          label="Skills"
          placeholder="e.g. React, Node.js, SQL"
          tags={form.skills}
          onAdd={(v) => updateField("skills", [...form.skills, v])}
          onRemove={(i) => updateField("skills", form.skills.filter((_, idx) => idx !== i))}
        />
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 16,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Quicksand_600SemiBold", color: "#9CA3AF", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
            Summary
          </Text>
          {[
            { label: "Title", value: form.title || "—" },
            { label: "Location", value: form.location || "—" },
            { label: "Salary", value: form.salaryMin && form.salaryMax ? `$${form.salaryMin} – $${form.salaryMax}` : "—" },
            { label: "Category", value: CATEGORIES.find((c) => c.id === form.category)?.label || "—" },
            { label: "Types", value: form.types.join(", ") || "—" },
          ].map(({ label, value }) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
              <Text style={{ fontSize: 12, fontFamily: "Quicksand_500Medium", color: "#9CA3AF" }}>{label}</Text>
              <Text style={{ fontSize: 12, fontFamily: "Quicksand_600SemiBold", color: "#374151", flex: 1, textAlign: "right", marginLeft: 12 }} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </>
    );

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        {/* ── Full-screen container ── */}
        <View style={{ flex: 1, justifyContent: "flex-end" }}>

          {/* ── Backdrop: Pressable so it doesn't collapse child height ── */}
          <Pressable
            onPress={handleClose}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
          />

          {/* ── Sheet: plain View, NOT wrapped in TouchableWithoutFeedback ── */}
          <Animated.View
            style={{
              transform: [{ translateY }],
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: "92%",
              // Give the sheet a proper flex column so children can fill it
              flexDirection: "column",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 20,
            }}
          >
            {/* Drag handle */}
            <View
              {...panResponder.panHandlers}
              style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
            >
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" }} />
            </View>

            {/* Sheet header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <View>
                <Text style={{ fontSize: 17, fontFamily: "Quicksand_700Bold", color: "#111827" }}>
                  Post a Job
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Quicksand_500Medium", color: "#9CA3AF", marginTop: 2 }}>
                  Step {step + 1} of {STEPS}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <StepDots current={step} />
                <TouchableOpacity
                  onPress={handleClose}
                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable content + footer — flex: 1 so it fills remaining sheet space */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
              </ScrollView>

              {/* Footer */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopWidth: 1,
                  borderTopColor: "#F3F4F6",
                  backgroundColor: "#fff",
                }}
              >
                {step === 0 ? (
                  <TouchableOpacity
                    onPress={() => handleSubmit(true)}
                    disabled={submitting}
                    activeOpacity={0.7}
                    style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", color: "#6B7280" }}>Save Draft</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleBack}
                    disabled={submitting}
                    activeOpacity={0.7}
                    style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Ionicons name="arrow-back" size={16} color="#6B7280" />
                    <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", color: "#6B7280" }}>Back</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={step < STEPS - 1 ? handleNext : () => handleSubmit(false)}
                  disabled={submitting}
                  activeOpacity={0.85}
                  style={{ flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#0E7490", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : step < STEPS - 1 ? (
                    <>
                      <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", color: "#fff" }}>Continue</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={17} color="#fff" />
                      <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", color: "#fff" }}>Post Job</Text>
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