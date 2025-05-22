import useTranslation from "../../hooks/useTranslation";
import { Languages } from "../types";
import { useLanguageContext } from "./LanguageContext";

export default function LanguagesDropDown() {

   const { t } = useTranslation();
   const { language, toggleLanguage } = useLanguageContext();

   return (
      <details className="dropdown">
         <summary>{t('language')}</summary>
         <div className="dropdown-content bg-base-100 rounded-box z-1 shadow-sm text-nowrap">
            <div className="join join-vertical">
               {Languages.map(lang =>
                  <button
                     key={lang.code}
                     className={`join-item btn btn-secondary btn-outline ${lang.code === language ? "btn-active" : ""}`}
                     onClick={() => toggleLanguage(lang.code)}
                  >
                     {lang.display}
                  </button>
               )}
            </div>
         </div>
      </details>
   )
}