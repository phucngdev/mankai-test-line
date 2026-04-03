import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationVN from './locales/vi/translation.json';
import translationJP from './locales/jp/translation.json';

const savedLanguage = localStorage.getItem('language') || 'vi';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    vi: { translation: translationVN },
    jp: { translation: translationJP },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', lng => {
  localStorage.setItem('language', lng);
});

export default i18n;
