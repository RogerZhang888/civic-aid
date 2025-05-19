import { useLanguageContext } from "../components/language/LanguageContext";
import en from "../components/language/translations/en";
import zh from "../components/language/translations/zh";
import ms from "../components/language/translations/ms";
import ta from "../components/language/translations/ta";
import { SiteLanguages } from "../components/types";
import React from "react";

const translations: Record<SiteLanguages, Record<string, string | React.ReactNode>> = {
   en,
   zh,
   ms,
   ta
};

export default function useTranslation() {
   const { language }: { language: keyof typeof translations } = useLanguageContext();

   function t(key: string): string | React.ReactNode {
      return translations[language]?.[key] || key;
   };

   return { t };
};
