import { View } from "react-native";
import DropdownField from "../fields/DropdownField";
import FieldWrapper from "../fields/FieldWrapper";
import FileUploadField from "../fields/FileUploadField";
import MultiSelectField from "../fields/MultiSelectField";
import TextField from "../fields/TextField";
import PasswordField from "../fields/PasswordField";
import UsernameInput, { type UsernameStatus } from "@/components/common/UsernameInput";
import { useTranslation } from "react-i18next";
import type { UsernameTable, UsernameColumn } from "@/utils/username";

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: any;
  type?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  multiline?: boolean;
}

interface FormSectionProps {
  fields: FieldConfig[];
  formData: any;
  onInputChange: (key: string, value: any) => void;
  onToggleSkill?: (skill: string) => void;
  onFileUpload?: (field: string) => void;
  getDropdownData?: (key: string) => any[];
  skillsList?: string[];
  /** Props forwarded to UsernameInput fields */
  usernameTable?: UsernameTable;
  usernameColumn?: UsernameColumn;
  usernameFullName?: string;
  excludeUsernameId?: string;
  onUsernameStatusChange?: (status: UsernameStatus) => void;
}

export default function FormSection({
  fields,
  formData,
  onInputChange,
  onToggleSkill,
  onFileUpload,
  getDropdownData,
  skillsList = [],
  usernameTable,
  usernameColumn,
  usernameFullName,
  excludeUsernameId,
  onUsernameStatusChange,
}: FormSectionProps) {
  const { t } = useTranslation("auth");

  const getFieldLabel = (field: FieldConfig) => {
    if (field.label === "Company Website (Optional)") {
      return t("fields.companyWebsiteOptional", { defaultValue: field.label });
    }
    return t(`fields.${field.key}`, { defaultValue: field.label });
  };

  const getFieldPlaceholder = (field: FieldConfig) => {
    if (field.placeholder === "Enter company email") {
      return t("placeholders.companyEmail", { defaultValue: field.placeholder });
    }
    if (field.placeholder === "Enter company website") {
      return t("placeholders.companyWebsite", {
        defaultValue: field.placeholder,
      });
    }
    return t(`placeholders.${field.key}`, { defaultValue: field.placeholder });
  };

  const renderField = (field: FieldConfig) => {
    const hasIcon = field.type !== "dropdown" && field.type !== "file" && field.type !== "username";
    const label = getFieldLabel(field);
    const placeholder = getFieldPlaceholder(field);

    switch (field.type) {
      case "username":
        return (
          <FieldWrapper
            label={label}
            required
            icon={field.icon}
            showIconInside={false}
          >
            <UsernameInput
              value={formData[field.key] ?? ""}
              onChangeText={(val) => onInputChange(field.key, val)}
              table={usernameTable ?? "jobseeker_profiles"}
              column={usernameColumn ?? "username"}
              fullName={usernameFullName}
              excludeId={excludeUsernameId}
              placeholder={placeholder}
              onStatusChange={onUsernameStatusChange}
            />
          </FieldWrapper>
        );

      case "dropdown":
        return (
          <FieldWrapper
            label={label}
            required={
              !field.placeholder?.includes("optional") &&
              !field.placeholder?.includes("Optional")
            }
            icon={field.icon}
            showIconInside={false}
          >
            <DropdownField
              data={getDropdownData ? getDropdownData(field.key) : []}
              value={formData[field.key]}
              placeholder={placeholder}
              onChange={(value) => onInputChange(field.key, value)}
            />
          </FieldWrapper>
        );

      case "multiselect":
        return (
          <FieldWrapper
            label={label}
            required={
              !field.placeholder?.includes("optional") &&
              !field.placeholder?.includes("Optional")
            }
            icon={field.icon}
            showIconInside={false}
          >
            <MultiSelectField
              options={skillsList}
              selectedValues={formData.skills || []}
              onToggle={onToggleSkill || (() => {})}
            />
          </FieldWrapper>
        );

      case "file":
        return (
          <FieldWrapper
            label={label}
            required={
              !field.placeholder?.includes("optional") &&
              !field.placeholder?.includes("Optional")
            }
            icon={field.icon}
            showIconInside={false}
          >
            <FileUploadField
              placeholder={placeholder}
              isUploaded={!!formData[field.key]}
              onPress={() => onFileUpload && onFileUpload(field.key)}
            />
          </FieldWrapper>
        );

      default:
        // Password field with security indicator
        if (field.secureTextEntry) {
          return (
            <FieldWrapper
              label={label}
              required={
                !field.placeholder?.includes("optional") &&
                !field.placeholder?.includes("Optional")
              }
              icon={field.icon}
              showIconInside={true}
            >
              <PasswordField
                hasIcon={hasIcon}
                placeholder={placeholder}
                value={formData[field.key]}
                onChangeText={(value) => onInputChange(field.key, value)}
                // Show strength indicator only for the main password field
                showStrengthIndicator={field.key === "password"}
              />
            </FieldWrapper>
          );
        }

        // Regular text field
        return (
          <FieldWrapper
            label={label}
            required={
              !field.placeholder?.includes("optional") &&
              !field.placeholder?.includes("Optional")
            }
            icon={field.icon}
            showIconInside={true}
          >
            <TextField
              hasIcon={hasIcon}
              placeholder={placeholder}
              value={formData[field.key]}
              onChangeText={(value) => onInputChange(field.key, value)}
              keyboardType={field.keyboardType}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 3 : 1}
            />
          </FieldWrapper>
        );
    }
  };

  return (
    <View className="space-y-4">
      {fields.map((field) => (
        <View key={field.key}>{renderField(field)}</View>
      ))}
    </View>
  );
}
