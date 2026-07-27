    // Jest setup file - runs before all tests

// Mock i18n config first (before other imports)
jest.mock('@/i18n/config', () => ({
  applyUserLanguage: jest.fn(),
  resetToDeviceLanguage: jest.fn(),
}));

// Mock React Native core modules
jest.mock('react-native', () => {
  const React = require('react');
  return {
    ...React,
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    StyleSheet: { create: jest.fn(() => ({})) },
    Platform: { OS: 'ios' },
    Dimensions: { get: jest.fn(() => ({ width: 375, height: 667 })) },
    Alert: { alert: jest.fn() },
    Linking: { openURL: jest.fn(), canOpenURL: jest.fn(() => Promise.resolve(true)) },
    StatusBar: { setBarStyle: jest.fn(), setBackgroundColor: jest.fn() },
    SafeAreaView: 'SafeAreaView',
    Modal: 'Modal',
    ActivityIndicator: 'ActivityIndicator',
  };
});

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        router: {},
        eas: {
          projectId: 'test-project-id',
        },
      },
    },
  },
}));

jest.mock('expo-device', () => ({
  getDeviceTypeAsync: jest.fn(),
  isDevice: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, string) => {
    return Promise.resolve(
      Array.from(string)
        .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
        .toString(16)
    );
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getDevicePushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  removeAllScheduledNotificationsAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/tmp/',
  cacheDirectory: '/tmp/cache/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({ children }) => children,
  useKeyboardController: jest.fn(() => ({
    keyboardVisible: false,
    keyboardHeight: 0,
  })),
}));

jest.mock('sonner-native', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => ({}), { virtual: true });

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  createStyledComponent: jest.fn(),
  useColorScheme: jest.fn(() => 'light'),
  getColorScheme: jest.fn(() => 'light'),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
  Redirect: 'Redirect',
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
