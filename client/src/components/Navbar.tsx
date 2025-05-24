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

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const { t } = useTranslation();
   const { data: user, isLoading } = useUser();
   const { data: notifications, isLoading: isLoadingNotifications } = useNotifications()
   const { language } = useLanguageContext();

   const [showNotifications, setShowNotifications] = useState(false)

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

   const markNotificationRead = (id: number) => {
        axios.post(
            `${SERVER_API_URL}/api/notifications/${id}`,
            {},
            { withCredentials: true }
        )
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
                                   className={`hover:text-white transition ${
                                       pathname === "/about"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/profile"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/community"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/chatbot"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/about"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/admin"
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
                                   className={`hover:text-white transition ${
                                       pathname === "/community"
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
                   className="fixed top-20 right-4 bg-white border border-gray-200 shadow-2xl rounded-xl w-100 h-72 p-2 overflow-y-auto"
                   onMouseLeave={() => setShowNotifications(false)}
               >
                   <h3 className="text-lg text-black mb-2">Notifications</h3>

                   {isLoadingNotifications ? (
                       <div>Loading...</div>
                   ) : (
                       <ul className="space-y-2 text-sm text-black">
                           {notifications?.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((notification) => {
                               const formattedDate = new Date(
                                   notification.createdAt
                               ).toLocaleString();
                               return (
                                   <li
                                       key={notification.id}
                                       className={`p-2 rounded-md hover:bg-gray-100 transition ${
                                           notification.read
                                               ? "opacity-70"
                                               : "font-semibold"
                                       }`}
                                   >
                                       <button
                                            onClick={() => {
                                                markNotificationRead(notification.id);
                                                window.location.href = notification.link;
                                            }}
                                            className="w-full text-left"
                                        >
                                           <div className="flex justify-between items-center mb-1">
                                               <span>
                                                   {notification.text[language]}
                                               </span>
                                               {!notification.read && (
                                                   <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-2"></span>
                                               )}
                                           </div>
                                           <div className="text-xs text-gray-500">
                                               {formattedDate}
                                           </div>
                                       </button>
                                   </li>
                               );
                           })}
                       </ul>
                   )}
               </div>
           )}

           <div className="navbar-end">
               {user ? (
                   <div className="flex flex-row items-center space-x-4">
                       <div
                           className="hidden sm:block"
                           onMouseEnter={() => {
                               setShowNotifications(false);
                           }}
                       >
                           {t("welcome")}
                           <strong>{user.username}</strong>
                       </div>
                       <div className="flex">
                           <div
                           className="cursor-pointer"
                               onMouseEnter={() => {
                                   setShowNotifications(true);
                               }}
                           >
                               <Bell />
                           </div>
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
