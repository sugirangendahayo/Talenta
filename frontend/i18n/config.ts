// i18n/config.ts

/* eslint-disable import/no-named-as-default-member */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import rw from './locales/rw.json';

const LANGUAGE_KEY = '@app_language';

// Get device language
const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  const deviceLocale = locales[0]?.languageCode || 'en';
  
  // Check if we support this language
  const supportedLanguages = ['en', 'fr', 'rw'];
  return supportedLanguages.includes(deviceLocale) ? deviceLocale : 'en';
};

// Get saved language or device language
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error loading language preference:', error);
    return getDeviceLanguage();
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      
      resources: {
        en: { translation: en },
        fr: { translation: fr },
        rw: { translation: rw },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false, // Important for React Native
      },
    });
};

// Save language preference
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Export for immediate use
initI18n();

export default i18n;