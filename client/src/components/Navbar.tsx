import { Link, useLocation, useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import useTranslation from "../hooks/useTranslation";
import LogoutButton from "./auth/LogoutButton";
import LanguagesDropDown from "./language/LanguageDropdown";

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const { t } = useTranslation();
   const { data: user, isLoading } = useUser();

   if (isLoading) {
      return (
         <div className="navbar shadow-[4px_4px_12px_2px_rgba(0,0,0,0.3)] bg-primary text-primary-content px-4 
         z-1 sticky top-0 h-4 hidden lg:flex"
         >
            <Link to="/" className="text-2xl font-bold">
               CivicAId
            </Link>
         </div>
      );
   }

   return (
      <div className="navbar shadow-[0_0_5px_2px_rgba(0,0,0,0.3)] bg-primary text-primary-content px-4 
      z-20 sticky top-0 h-4 hidden lg:flex"
      >
         <div className="navbar-start">

            <Link to="/" className="text-2xl font-bold">
               CivicAId
            </Link>

            <ul className="menu menu-horizontal pl-4 hidden lg:flex">
               {!user 
                  ?  <>
                        <li>
                           <Link
                              to="/about"
                              className={`hover:text-white transition ${pathname === "/about" ? "text-primary-content" : ""}`}
                           >
                              {t('about')}
                           </Link>
                        </li>
                        <li>
                           <LanguagesDropDown/>
                        </li>
                     </>
                  :  user.permissions.length === 0 ?
                     <>
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
                              to="/community"
                              className={`hover:text-white transition ${
                                 pathname === "/community" ? "text-primary-content" : ""
                              }`}
                           >
                              {t('community')}
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
                              {t('about')}
                           </Link>
                        </li>
                        <li>
                           <LanguagesDropDown/>
                        </li>
                     </>
                  :  <>
                        <li>
                           <Link
                              to="/admin"
                              className={`hover:text-white transition ${
                                 pathname === "/admin" ? "text-primary-content" : ""
                              }`}
                           >
                              Admin Dashboard
                           </Link>
                        </li>
                        <li>
                           <Link
                              to="/community"
                              className={`hover:text-white transition ${
                                 pathname === "/community" ? "text-primary-content" : ""
                              }`}
                           >
                              {t('community')}
                           </Link>
                        </li>
                        <li>
                           <LanguagesDropDown/>
                        </li>
                     </>
               }
            </ul>

         </div>

         <div className="navbar-end">
            {user ? (
               <div className="flex flex-row items-center space-x-4">
                  <div className="hidden sm:block">{t('welcome')}<strong>{user.username}</strong></div>
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
