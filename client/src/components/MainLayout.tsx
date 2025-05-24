import Navbar from "./Navbar";
import { SquareMenu, Bell } from "lucide-react";
import CombinedMobileSidebar from "./CombinedMobileSidebar";
import { useState } from "react";
import useNotifications from "../hooks/useNotifications";
import { useLanguageContext } from "./language/LanguageContext";
import axios from "axios";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function MainLayout({children}: {children: React.ReactNode}) {
       const { data: notifications, isLoading: isLoadingNotifications } = useNotifications()
       const { language } = useLanguageContext();
    
       const [showNotifications, setShowNotifications] = useState(false)

          const markNotificationRead = (id: number) => {
        axios.post(
            `${SERVER_API_URL}/api/notifications/${id}`,
            {},
            { withCredentials: true }
        )
   }

   return (
      <section className="h-screen w-screen flex flex-col drawer" data-theme="light" id="main-layout-container">
        {/* This version of notifications tab only shown on mobile */}
                   {showNotifications && (
               <div
                   className="fixed top-15 right-2 bg-white border border-gray-200 shadow-2xl rounded-xl w-72 h-72 p-2 overflow-y-auto lg:hidden z-10"
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

         <input id="mobile-sidebar" type="checkbox" className="drawer-toggle" />
         {/* Navbar only shown on >=lg */}
         <Navbar />
         <article className="flex-1 overflow-y-auto overflow-x-hidden drawer-content relative" id="main-outlet">
            <label htmlFor="mobile-sidebar" className="btn btn-ghost lg:hidden absolute top-3 left-1 z-10">
               <SquareMenu/>
            </label>
            {children}
            <label className="btn btn-ghost lg:hidden absolute top-3 right-1 z-10" onClick={() => setShowNotifications(!showNotifications)}>
               <Bell />
            </label>
         </article>
         {/* Combined sidebar only shown on <lg */}
         <CombinedMobileSidebar/>
      </section>
   );
}
