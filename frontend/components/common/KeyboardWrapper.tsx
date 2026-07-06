// components/common/KeyboardWrapper.tsx
import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface KeyboardWrapperProps {
  children: React.ReactNode;
  /**
   * Extra space (in px) between the focused input and the top of the keyboard.
   * Default 24 works for most screens. Increase to 40–60 for screens where
   * the submit button sits just above the keyboard.
   */
  bottomOffset?: number;
  /** Forward a refreshControl if this wrapper replaces a ScrollView that had one */
  refreshControl?: React.ReactElement;
  /** Additional styles for the scroll content container */
  contentStyle?: object;
}

export default function KeyboardWrapper({
  children,
  bottomOffset = 24,
  refreshControl,
  contentStyle,
}: KeyboardWrapperProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        bottomOffset={bottomOffset}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
      >
        {children}
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
