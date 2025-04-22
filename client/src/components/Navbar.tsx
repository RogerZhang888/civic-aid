import { Link, useLocation, useNavigate } from "react-router-dom";
import useUser from "./auth/useUser";
import { AlignJustify } from "lucide-react";
import { useLanguageContext } from "./language/LanguageContext";
import { Languages } from "./types";
import useTranslation from "./language/useTranslation";
import LogoutButton from "./auth/LogoutButton";

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const { t } = useTranslation();
   const { language, toggleLanguage } = useLanguageContext();
   const { data: user, isLoading } = useUser();

   if (isLoading) {
      return (
         <div className="navbar shadow-sm bg-secondary text-primary-content">
            <Link to="/" className="btn btn-ghost text-2xl">
               CivicAId
            </Link>
         </div>
      );
   }
   return (
      
      <div className="navbar shadow-sm bg-primary text-primary-content px-4 z-1 fixed">
         <div className="navbar-start">
            
            {user &&
               <div className="dropdown">
                  <button
                     tabIndex={0}
                     className="btn btn-square btn-sm lg:hidden me-4"
                  >
                     <AlignJustify size={25}/>
                  </button>

                  <ul
                     className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-black"
                  >
                     <li>
                        <Link
                           to="/profile"
                        >
                           {t('profile')}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/chatbot"
                        >
                           Chatbot
                        </Link>
                     </li>
                     <li>
                        <details className="dropdown">
                           <summary>Language</summary>
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
                     </li>
                  </ul>
               </div>
            }

            <Link to="/" className="text-2xl font-bold">
               CivicAId
            </Link>

            {user && (
               <div className="hidden lg:flex">
                  <ul className="menu menu-horizontal pl-4 space-x-4">
                     <li>
                        <Link
                           to="/profile"
                           className={`hover:text-white transition ${
                              pathname === "/profile" ? "text-primary-content" : ""
                           }`}
                        >
                           {t('profile')}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/chatbot"
                           className={`hover:text-white transition ${
                              pathname === "/chatbot" ? "text-primary-content" : ""
                           }`}
                        >
                           {t('chatbot')}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/about"
                           className={`hover:text-white transition ${pathname === "/about" ? "text-primary-content" : ""}`}
                        >
                           About
                        </Link>
                     </li>

                  </ul>
               </div>
            )}

            <div className="hidden lg:flex">
               <ul className={`menu menu-horizontal ${user ? "" : "px-4"}`}>
                  <li>
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
                  </li>
               </ul>
            </div>
         </div>

         <div className="navbar-end">
            {user ? (
               <div className="flex flex-row items-center space-x-4">
                  <div>{t('welcome')}<strong>{user.userName}</strong></div>
                  <LogoutButton />
               </div>
            ) : (
               <button
                  onClick={() => navigate("/auth")}
                  className="btn btn-sm btn-outline"
               >
                  {t('login')}
               </button>
            )}
         </div>
      </div>
   );
}


