import { useLanguageContext } from "./LanguageContext";
import en from "./translations/en";
import zh from "./translations/zh";
import ms from "./translations/ms";
import ta from "./translations/ta";
import { SiteLanguages } from "../types";

const translations: Record<SiteLanguages, Record<string, string>> = {
   en,
   zh,
   ms,
   ta
};

export default function useTranslation() {
   const { language }: { language: keyof typeof translations } = useLanguageContext();

   function t(key: string) {
      return translations[language]?.[key] || key;
   };

   return { t };
};
