import React, { useState, useEffect } from "react";
import { LanguageContext } from "./LanguageContext";
import { SiteLanguages } from "../types";

const LOCAL_STORAGE_KEY = "siteLanguage";

export default function LanguageProvider({ children }: { children: React.ReactNode }) {

   const [language, setLanguage] = useState<SiteLanguages>(() => {
      if (typeof window !== "undefined") {
         const savedLanguage = localStorage.getItem(LOCAL_STORAGE_KEY) as SiteLanguages;
         return savedLanguage || "en";
      } else {
         return "en";
      }
   });

   useEffect(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, language);
   }, [language]);

   const toggleLanguage = (newLanguage: SiteLanguages) => setLanguage(newLanguage);

   return (
      <LanguageContext.Provider
         value={{
            language,
            toggleLanguage
         }}
      >
         {children}
      </LanguageContext.Provider>
   );
}