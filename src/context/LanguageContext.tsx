import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { LANGUAGES, TRANSLATIONS, LanguageOption } from '../data/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguage: LanguageOption;
  languages: LanguageOption[];
  t: (key: string, defaultText?: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('ais_user_language');
    if (saved && ['en', 'so', 'ar', 'fr', 'es'].includes(saved)) {
      return saved as LanguageCode;
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('ais_user_language', lang);
    const langObj = LANGUAGES.find((l) => l.code === lang);
    if (langObj) {
      document.documentElement.dir = langObj.dir;
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    const langObj = LANGUAGES.find((l) => l.code === language);
    if (langObj) {
      document.documentElement.dir = langObj.dir;
      document.documentElement.lang = language;
    }
  }, [language]);

  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage,
        languages: LANGUAGES,
        t,
        dir: currentLanguage.dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      currentLanguage: LANGUAGES[0],
      languages: LANGUAGES,
      t: (key: string, defaultText?: string) => defaultText || key,
      dir: 'ltr',
    };
  }
  return context;
};
