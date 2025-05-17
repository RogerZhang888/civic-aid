import { useNavigate } from "react-router";
import useUser from "./auth/useUser";
import useTranslation from "./language/useTranslation";
import LogoutButton from "./auth/LogoutButton";

export default function CombinedMobileSidebar() {

   const { data: user, isLoading } = useUser();
   const { t } = useTranslation();
   const navigate = useNavigate();

   return (
      <div className="drawer-side z-20">
         <label htmlFor="mobile-sidebar" aria-label="close sidebar" className="drawer-overlay" />
         <div className="bg-primary text-white min-h-full w-80 p-4 flex flex-col">

            <div className="flex flex-row items-center justify-center space-x-3">
               <img
                  src="/mascot.png"
                  alt="CivicAId mascot"
                  className="h-15 w-15"
               />
               <div className="font-bold text-2xl">CivicAId</div>
            </div>

            <div className="mt-auto">
               {
                  isLoading ?
                     <div className="flex items-center justify-center">
                        <div className="loading loading-spinner loading-lg text-primary-content" />
                     </div> :
                  user
                  ?  <div className="flex flex-row items-center justify-center space-x-2">
                        <div>Welcome, <strong>{user.username}</strong></div>
                        <LogoutButton/>
                     </div>
                  :  <div className="flex flex-row items-center justify-center space-x-2">
                        <button 
                           className="btn btn-sm btn-outline"
                           onClick={() => navigate("/auth")}
                        >
                           Log In
                        </button>
                        <div>or</div>
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
