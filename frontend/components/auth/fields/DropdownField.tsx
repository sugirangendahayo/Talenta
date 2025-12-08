import { Dropdown } from "react-native-element-dropdown";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  data: DropdownOption[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export default function DropdownField({
  data,
  value,
  placeholder,
  onChange,
}: DropdownFieldProps) {
  return (
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      mode="modal"
      placeholder={placeholder}
      value={value}
      onChange={(item) => onChange(item.value)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
      placeholderStyle={{
        color: "#6B7280",
        fontFamily: "QuicksandMedium",
        fontSize: 14,
        textAlign: "center",
      }}
      selectedTextStyle={{
        color: "#111827",
        fontFamily: "QuicksandMedium",
        fontSize: 14,
        textAlign: "center",
      }}
      containerStyle={{
        borderRadius: 16,
        overflow: "hidden",
      }}
      itemTextStyle={{
        fontFamily: "QuicksandMedium",
        fontSize: 14,
        color: "#374151",
      }}
      activeColor="#E0F2FE"
    />
  );
}
