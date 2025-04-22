import { createContext, useContext } from "react";
import { LanguageContextType } from "../types";

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguageContext() {
   const ctx = useContext(LanguageContext);
   if (ctx === null) {
      throw new Error("useLanguageContext must be used within a LanguageProvider");
   }
   return ctx;
}