import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import tr from './locales/tr.json'
import en from './locales/en.json'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr },
            en: { translation: en }
        },
        lng: 'en', // Varsayılan dil - İngilizce
        fallbackLng: 'tr',
        interpolation: {
            escapeValue: false
        }
    })

export default i18n
