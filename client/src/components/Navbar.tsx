import { Link, useLocation, useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import useTranslation from "../hooks/useTranslation";
import LogoutButton from "./auth/LogoutButton";
import LanguagesDropDown from "./language/LanguageDropdown";
import useNotifications from "../hooks/useNotifications";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useLanguageContext } from "./language/LanguageContext";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const { t } = useTranslation();
   const { data: user, isLoading } = useUser();
   const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();
   const { language } = useLanguageContext();
   const qc = useQueryClient();

   const [showNotifications, setShowNotifications] = useState(false);

   const hasNewNotifications = notifications?.some(n => n.read === false);

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

   const markNotificationRead = async (id: number) => {
      await axios.post(
         `${SERVER_API_URL}/api/notifications/${id}`,
         {},
         { withCredentials: true }
      )
      await qc.refetchQueries({ queryKey: ['notifications'] })
   }

   return (
      <div
         className="navbar shadow-[0_0_5px_2px_rgba(0,0,0,0.3)] bg-primary text-primary-content px-4 
      z-20 sticky top-0 h-4 hidden lg:flex"
      >
         <div className="navbar-start">
            <Link to="/" className="text-2xl font-bold">
               CivicAId
            </Link>

            <ul className="menu menu-horizontal pl-4 hidden lg:flex">
               {!user ? (
                  <>
                     <li>
                        <Link
                           to="/about"
                           className={`hover:text-white transition ${pathname === "/about"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("about")}
                        </Link>
                     </li>
                     <li>
                        <LanguagesDropDown />
                     </li>
                  </>
               ) : user.permissions.length === 0 ? (
                  <>
                     <li>
                        <Link
                           to="/profile"
                           className={`hover:text-white transition ${pathname === "/profile"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("profile")}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/community"
                           className={`hover:text-white transition ${pathname === "/community"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("community")}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/chatbot"
                           className={`hover:text-white transition ${pathname === "/chatbot"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("chatbot")}
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/about"
                           className={`hover:text-white transition ${pathname === "/about"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("about")}
                        </Link>
                     </li>
                     <li>
                        <LanguagesDropDown />
                     </li>
                  </>
               ) : (
                  <>
                     <li>
                        <Link
                           to="/admin"
                           className={`hover:text-white transition ${pathname === "/admin"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           Admin Dashboard
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/community"
                           className={`hover:text-white transition ${pathname === "/community"
                                 ? "text-primary-content"
                                 : ""
                              }`}
                        >
                           {t("community")}
                        </Link>
                     </li>
                  </>
               )}
            </ul>
         </div>

         {showNotifications && (
            <div
               className="fixed top-20 right-4 bg-base-100
               card shadow-xl w-100 h-72 overflow-y-auto"
               onMouseLeave={() => setShowNotifications(false)}
            >
               <div className="card-body">
                  <div className="card-title text-xl font-semibold text-black mb-2">{t('notifs')}</div>

                  {isLoadingNotifications ? (
                     <div className="flex flex-1 flex-row justify-center items-center">
                        <div className="loading loading-spinner text-primary"/>
                        <div className="mt-2 text-gray-500">Loading notifications...</div>
                     </div>
                  ) : notifications?.length === 0 || !notifications ? (
                     <div className="flex flex-1 justify-center items-center">
                        <div className="text-gray-500">You do not have any notifications.</div>
                     </div>
                  ) : (
                     <div className="space-y-3 text-sm text-black">
                        {notifications
                           .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                           .map(n => 
                              <div
                                 key={n.id}
                                 onClick={async () => {
                                    navigate(n.link);
                                    await markNotificationRead(n.id);
                                 }}
                                 className={`p-2 bg-gray-200 rounded-md hover:cursor-pointer text-left flex flex-col shadow ${n.read
                                    ? ""
                                    : "font-semibold"
                                 }`}
                              >
                                 <div className="flex justify-between items-center mb-1">
                                    <span>
                                       {n.text[language]}
                                    </span>
                                    {!n.read && (
                                       <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-2"/>
                                    )}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                    {n.createdAt.toLocaleString()}
                                 </div>
                              </div>
                           )}
                     </div>

                  )}
               </div>

            </div>
         )}

         <div className="navbar-end">
            {user ? (
               <div className="flex flex-row items-center space-x-4">
                  <div
                     onMouseEnter={() => {
                        setShowNotifications(false);
                     }}
                  >
                     {t("welcome")}
                     <strong>{user.username}</strong>
                  </div>
                  <div
                     className="cursor-pointer relative"
                     onMouseEnter={() => {
                        setShowNotifications(true);
                     }}
                     >
                     <Bell className={`h-6 w-6 ${
                        hasNewNotifications 
                           ? "animate-[pulse_1.5s_ease-in-out_infinite]" 
                           : ""
                        }`} 
                     />
                     {hasNewNotifications && (
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                     )}
                  </div>
                  <LogoutButton />
               </div>
            ) : (
               <button
                  onClick={() => navigate("/auth")}
                  className="btn btn-sm btn-outline"
               >
                  {t("login")}
               </button>
            )}
         </div>
      </div>
   );
}
