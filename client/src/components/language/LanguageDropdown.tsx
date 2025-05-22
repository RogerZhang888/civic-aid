import useTranslation from "../../hooks/useTranslation";
import { Languages, SiteLanguages } from "../types";
import { useLanguageContext } from "./LanguageContext";

export default function LanguagesDropDown() {

   const { t } = useTranslation();
   const { language, toggleLanguage } = useLanguageContext();

   const handleLanguageChange = (langCode: SiteLanguages) => {
      toggleLanguage(langCode);
      (document.activeElement as HTMLElement)?.blur();
   };

   return (
      <details className="dropdown">
         <summary>{t('language')}</summary>
         <div className="dropdown-content bg-base-100 rounded-box z-1 shadow-sm text-nowrap">
            <div className="join join-vertical">
               {Languages.map(lang =>
                  <button
                     key={lang.code}
                     className={`join-item btn btn-secondary btn-outline ${lang.code === language ? "btn-active" : ""}`}
                     onClick={() => handleLanguageChange(lang.code)}
                  >
                     {lang.display}
                  </button>
               )}
            </div>
         </div>
      </details>
   )
}