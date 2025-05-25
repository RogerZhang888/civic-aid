import Navbar from "./Navbar";
import { SquareMenu, Bell } from "lucide-react";
import CombinedMobileSidebar from "./CombinedMobileSidebar";
import { useState } from "react";
import useNotifications from "../hooks/useNotifications";
import { useLanguageContext } from "./language/LanguageContext";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import useTranslation from "../hooks/useTranslation";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function MainLayout({ children }: { children: React.ReactNode }) {
   const { data: notifications, isLoading: isLoadingNotifications } = useNotifications()
   const { language } = useLanguageContext();
   const qc = useQueryClient();
   const navigate = useNavigate();
   const [showNotifications, setShowNotifications] = useState(false);
   const { t } = useTranslation();

   const markNotificationRead = async (id: number) => {
      await axios.post(
         `${SERVER_API_URL}/api/notifications/${id}`,
         {},
         { withCredentials: true }
      )
      await qc.refetchQueries({ queryKey: ['notifications'] })
   }

   const hasNewNotifications = notifications?.some(n => n.read === false);

   return (
      <section className="h-screen w-screen flex flex-col drawer" data-theme="light" id="main-layout-container">
         {/* This version of notifications tab only shown on mobile */}
         {showNotifications && (
            <div
               className="fixed top-20 right-4 bg-base-100
               card shadow-xl w-100 h-72 overflow-y-auto z-100"
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

         <input id="mobile-sidebar" type="checkbox" className="drawer-toggle" />
         {/* Navbar only shown on >=lg */}
         <Navbar />
         <article className="flex-1 overflow-y-auto overflow-x-hidden drawer-content relative" id="main-outlet">
            <label htmlFor="mobile-sidebar" className="btn btn-ghost lg:hidden absolute top-3 left-1 z-10">
               <SquareMenu />
            </label>
            {children}
            <label className="btn btn-ghost lg:hidden absolute top-3 right-1 z-10" onClick={() => setShowNotifications(!showNotifications)}>
               <div className="relative">
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
            </label>
         </article>
         {/* Combined sidebar only shown on <lg */}
         <CombinedMobileSidebar />
      </section>
   );
}
