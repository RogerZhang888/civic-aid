import { Link, useNavigate } from "react-router";
import useUser from "./auth/useUser";
import useTranslation from "./language/useTranslation";
import LogoutButton from "./auth/LogoutButton";
import { SquareChevronDown } from "lucide-react";
import { LanguagesDropDown } from "./Navbar";
import ChatsButtonColumn from "./chatbot/ChatButtonsColumn";

export default function CombinedMobileSidebar() {

   const { data: user, isLoading } = useUser();
   const { t } = useTranslation();
   const navigate = useNavigate();

   return (
      <div className="drawer-side z-20">
         <label htmlFor="mobile-sidebar" aria-label="close sidebar" className="drawer-overlay" />
         <div className="bg-primary text-white min-h-full w-80 p-4 flex flex-col">

            <div className="flex flex-row items-center justify-center space-x-3" id="sidebar-header">
               <img
                  src="/mascot.png"
                  alt="CivicAId mascot"
                  className="h-15 w-15"
               />
               <Link to="/" className="text-2xl font-bold">
                  CivicAId
               </Link>
               <div className="dropdown dropdown-end">
                  <button
                     tabIndex={0}
                     className="btn btn-ghost btn-sm"
                  >
                     <SquareChevronDown size={25} />
                  </button>

                  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-black">
                     {user &&
                        <>
                           {user.permissions.length !== 0 &&
                              <li>
                                 <Link
                                    to="/admin"
                                 >
                                    Admin Panel
                                 </Link>
                              </li>
                           }
                           <li>
                              <Link
                                 to="/profile"
                              >
                                 {t('profile')}
                              </Link>
                           </li>
                        </>
                     }
                     <li>
                        <Link
                           to="/about"
                        >
                           {t('about')}
                        </Link>
                     </li>
                     <li>
                        <LanguagesDropDown />
                     </li>
                  </ul>
               </div>
            </div>

            <div className="flex h-full flex-col overflow-y-auto space-y-2" id="sidebar-middle">
               <div className="font-semibold mb-2">Your chats:</div>
               {user
                  ?  <ChatsButtonColumn/>
                  :  <div className="text-center text-sm font-semibold">Log in to start chatting!</div>
               }
            </div>

            <div className="mt-auto" id="sidebar-footer">
               {
                  isLoading ?
                     <div className="flex items-center justify-center">
                        <div className="loading loading-spinner loading-lg text-primary-content" />
                     </div> :
                     user
                        ? <div className="flex flex-row items-center justify-center space-x-2">
                           <div>{t('welcome')}<strong>{user.username}</strong></div>
                           <LogoutButton />
                        </div>
                        : <div className="flex flex-row items-center justify-center space-x-2">
                           <button
                              className="btn btn-sm btn-outline"
                              onClick={() => navigate("/auth")}
                           >
                              {t('login')}
                           </button>
                           <button
                              className="btn btn-sm btn-outline"
                              onClick={() => navigate("/auth/reg")}
                           >
                              Sign Up
                           </button>
                        </div>
               }
            </div>
         </div>
      </div>
   )
}
