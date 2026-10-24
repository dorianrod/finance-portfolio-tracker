import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'

void i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  resources: {
    en: {
      translation: en,
    },
  },
})

export default i18n
