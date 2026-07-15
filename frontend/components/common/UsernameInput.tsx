/**
 * UsernameInput.tsx
 *
 * A self-contained, polished username input component that:
 *  - Matches the exact look-and-feel of other auth form fields
 *  - Shows an @ prefix inside the field (left edge)
 *  - Debounces availability checks (400 ms)
 *  - Shows a spinner while checking
 *  - Shows ✅ "Available" or ❌ "Already taken" inline
 *  - Shows tappable suggestion chips when taken
 *  - Enforces format rules inline
 *  - Supports both jobseeker usernames and employer company_usernames
 *
 * Bug fixes applied:
 *  - onStatusChange is stored in a ref so it never enters the effect
 *    dependency array → eliminates the infinite checking loop that occurred
 *    when the parent re-created the callback on every render.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  checkUsernameAvailability,
  generateUsernameSuggestions,
  filterAvailableSuggestions,
  validateUsernameFormat,
  type UsernameTable,
  type UsernameColumn,
} from "@/utils/username";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export interface UsernameInputProps {
  /** Current username value (controlled) */
  value: string;
  /** Called whenever the value changes */
  onChangeText: (text: string) => void;
  /** Called when the availability status changes — safe to be non-memoised */
  onStatusChange?: (status: UsernameStatus) => void;
  /** Called when the user picks a suggestion chip */
  onSuggestionPick?: (suggestion: string) => void;
  /** Full name used to derive suggestions when the chosen name is taken */
  fullName?: string;
  /** Which DB table to check against */
  table: UsernameTable;
  /** Which column to check against */
  column: UsernameColumn;
  /** Current user's own ID — excluded from the uniqueness check */
  excludeId?: string;
  /** External error flag (e.g. form validation shake) */
  hasError?: boolean;
  /** Placeholder inside the text field */
  placeholder?: string;
  /** Debounce delay in ms (default: 400) */
  debounceMs?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsernameInput({
  value,
  onChangeText,
  onStatusChange,
  onSuggestionPick,
  fullName,
  table,
  column,
  excludeId,
  hasError,
  placeholder = "username",
  debounceMs = 400,
}: UsernameInputProps) {
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [formatError, setFormatError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── KEY FIX: store onStatusChange in a ref so the effect below does NOT
  //    need to list it as a dependency. Without this, every parent re-render
  //    (triggered by setUsernameStatus) produces a new callback reference,
  //    which changes the ref → re-fires the effect → infinite loop. ────────────
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange; // always up-to-date, no re-renders

  // Also store the latest fullName in a ref for the same reason
  const fullNameRef = useRef(fullName);
  fullNameRef.current = fullName;

  const updateStatus = (next: UsernameStatus) => {
    setStatus(next);
    onStatusChangeRef.current?.(next);
  };

  // ── Availability check effect ─────────────────────────────────────────────
  // Deps: only the values that should actually re-trigger a check.
  // Callbacks (onStatusChange, etc.) are intentionally kept out via refs.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();

    if (!trimmed) {
      updateStatus("idle");
      setFormatError(null);
      setSuggestions([]);
      return;
    }

    const fmtError = validateUsernameFormat(trimmed);
    if (fmtError) {
      setFormatError(fmtError);
      updateStatus("invalid");
      setSuggestions([]);
      return;
    }

    setFormatError(null);
    // Show "checking" immediately (before the debounce) so the UI feels responsive
    updateStatus("checking");

    debounceRef.current = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(trimmed, table, column, excludeId);

      if (isAvailable) {
        updateStatus("available");
        setSuggestions([]);
      } else {
        updateStatus("taken");
        // Generate suggestions using the latest fullName
        const allSuggestions = generateUsernameSuggestions(
          fullNameRef.current || trimmed,
          new Set([trimmed.toLowerCase()])
        );
        const availableSuggestions = await filterAvailableSuggestions(
          allSuggestions,
          table,
          column,
          excludeId
        );
        setSuggestions(availableSuggestions.slice(0, 4));
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, table, column, excludeId, debounceMs]);
  // ^ onStatusChange and fullName are intentionally omitted — they live in refs.

  // ── Border / input colour based on status ────────────────────────────────
  const borderColor =
    hasError || status === "invalid" || status === "taken"
      ? "#F87171"   // red-400
      : status === "available"
      ? "#10B981"   // emerald-500
      : "#D1D5DB";  // gray-300 (matches FieldWrapper border)

  // ── Status text row ───────────────────────────────────────────────────────
  const renderStatusRow = () => {
    if (status === "invalid" && formatError) {
      return (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="close-circle" size={13} color="#F87171" />
          <Text className="text-red-400 font-quicksandMedium text-xs">
            {formatError}
          </Text>
        </View>
      );
    }
    if (status === "checking") {
      return (
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <ActivityIndicator
            size="small"
            color="#9CA3AF"
            style={{ transform: [{ scale: 0.65 }] }}
          />
          <Text className="text-gray-400 font-quicksandMedium text-xs">
            Checking availability…
          </Text>
        </View>
      );
    }
    if (status === "available") {
      return (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="checkmark-circle" size={13} color="#10B981" />
          <Text className="text-emerald-500 font-quicksandSemibold text-xs">
            Available ✓
          </Text>
        </View>
      );
    }
    if (status === "taken") {
      return (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons name="close-circle" size={13} color="#F87171" />
          <Text className="text-red-400 font-quicksandSemibold text-xs">
            Already taken
          </Text>
        </View>
      );
    }
    return null;
  };

  // ── Suggestion chips ──────────────────────────────────────────────────────
  const renderSuggestions = () => {
    if (status !== "taken" || suggestions.length === 0) return null;
    return (
      <View className="mt-2">
        <Text className="text-gray-400 font-quicksandMedium text-xs mb-1.5">
          Try one of these:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                onChangeText(s);
                onSuggestionPick?.(s);
              }}
              className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-full px-3 py-1.5"
              activeOpacity={0.75}
            >
              <Text className="text-cyan-700 dark:text-cyan-400 font-quicksandSemibold text-xs">
                @{s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View>
      {/* ── Input field — styled to match TextField / FieldWrapper ── */}
      <View
        className="flex-row items-center rounded-2xl overflow-hidden"
        style={{
          // Matches FieldWrapper: bg-white dark:bg-[#080A08] with border
          // (dark mode border handled by borderColor derived from status)
          borderWidth: 1,
          borderColor,
        }}
      >
        {/* @ prefix — styled like the left icon area in other fields */}
        <View className="bg-white dark:bg-[#080A08] px-3 py-3 border-r border-gray-200 dark:border-[#2a2a2a]">
          <Text className="font-quicksandBold text-sm text-gray-400 dark:text-gray-500">
            @
          </Text>
        </View>

        {/* Text input — matches TextField baseline styles */}
        <TextInput
          value={value}
          onChangeText={(text) => {
            // Strip uppercase and spaces on the fly
            onChangeText(text.toLowerCase().replace(/\s/g, ""));
          }}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          className="flex-1 bg-white dark:bg-[#080A08] font-quicksandMedium text-gray-800 dark:text-gray-200 px-3 py-3"
        />

        {/* Right-side status icon */}
        <View className="bg-white dark:bg-[#080A08] px-3 py-3">
          {status === "checking" ? (
            <ActivityIndicator
              size="small"
              color="#9CA3AF"
              style={{ transform: [{ scale: 0.75 }] }}
            />
          ) : status === "available" ? (
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          ) : status === "taken" || status === "invalid" ? (
            <Ionicons name="close-circle" size={18} color="#F87171" />
          ) : (
            // Invisible placeholder so width doesn't jump
            <View style={{ width: 18, height: 18 }} />
          )}
        </View>
      </View>

      {/* Status text */}
      {renderStatusRow()}

      {/* Suggestion chips */}
      {renderSuggestions()}
    </View>
  );
}
