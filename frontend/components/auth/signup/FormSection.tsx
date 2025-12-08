import { View } from "react-native";
import DropdownField from "../fields/DropdownField";
import FieldWrapper from "../fields/FieldWrapper";
import FileUploadField from "../fields/FileUploadField";
import MultiSelectField from "../fields/MultiSelectField";
import TextField from "../fields/TextField";

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
  onToggleSkill: (skill: string) => void;
  onFileUpload: (field: string) => void;
  getDropdownData?: (key: string) => any[];
  skillsList?: string[];
}

export default function FormSection({
  fields,
  formData,
  onInputChange,
  onToggleSkill,
  onFileUpload,
  getDropdownData,
  skillsList = [],
}: FormSectionProps) {
  const renderField = (field: FieldConfig) => {
    const hasIcon = field.type !== "dropdown" && field.type !== "file";

    switch (field.type) {
      case "dropdown":
        return (
          <FieldWrapper
            label={field.label}
            required={!field.placeholder?.includes("optional")}
            icon={field.icon}
            showIconInside={false}
          >
            <DropdownField
              data={getDropdownData ? getDropdownData(field.key) : []}
              value={formData[field.key]}
              placeholder={field.placeholder}
              onChange={(value) => onInputChange(field.key, value)}
            />
          </FieldWrapper>
        );

      case "multiselect":
        return (
          <FieldWrapper
            label={field.label}
            required={!field.placeholder?.includes("optional")}
            icon={field.icon}
            showIconInside={false}
          >
            <MultiSelectField
              options={skillsList}
              selectedValues={formData.skills || []}
              onToggle={onToggleSkill}
            />
          </FieldWrapper>
        );

      case "file":
        return (
          <FieldWrapper
            label={field.label}
            required={!field.placeholder?.includes("optional")}
            icon={field.icon}
            showIconInside={false}
          >
            <FileUploadField
              placeholder={field.placeholder}
              isUploaded={!!formData[field.key]}
              onPress={() => onFileUpload(field.key)}
            />
          </FieldWrapper>
        );

      default:
        return (
          <FieldWrapper
            label={field.label}
            required={!field.placeholder?.includes("optional")}
            icon={field.icon}
            showIconInside={true}
          >
            <TextField
              hasIcon={hasIcon}
              placeholder={field.placeholder}
              value={formData[field.key]}
              onChangeText={(value) => onInputChange(field.key, value)}
              secureTextEntry={field.secureTextEntry}
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
