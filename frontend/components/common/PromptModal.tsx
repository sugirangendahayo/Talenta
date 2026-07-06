// components/common/PromptModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import KeyboardWrapper from '@/components/common/KeyboardWrapper';

export interface PromptModalProps {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  submitStyle?: 'default' | 'destructive';
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  visible,
  title,
  message,
  placeholder = 'Enter text...',
  defaultValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitStyle = 'default',
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState(defaultValue);

  const handleSubmit = () => {
    onSubmit(text);
    setText(defaultValue);
  };

  const handleCancel = () => {
    setText(defaultValue);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 px-6">
          <KeyboardWrapper contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-white dark:bg-[#141414] rounded-2xl p-6 shadow-xl w-full max-w-sm">
              <Text className="text-xl font-quicksandBold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </Text>
              
              {message && (
                <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-4">
                  {message}
                </Text>
              )}

              <TextInput
                className="w-full bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-sm font-quicksandMedium text-gray-800 dark:text-gray-100 mb-6"
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={text}
                onChangeText={setText}
                autoFocus
              />

              <View className="flex-row justify-end gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2a2a]"
                >
                  <Text className="text-sm font-quicksandBold text-gray-600 dark:text-gray-300">
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  className={`px-4 py-2.5 rounded-xl ${
                    submitStyle === 'destructive' 
                      ? 'bg-red-500' 
                      : 'bg-cyan-700'
                  }`}
                >
                  <Text className="text-sm font-quicksandBold text-white">
                    {submitText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardWrapper>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
