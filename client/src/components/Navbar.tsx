import { Link, useLocation, useNavigate } from "react-router-dom";
import useUser from "./auth/useUser";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();

   const { data: user, isLoading } = useUser();

   if (isLoading) {
      return (
         <nav className="bg-blue-600 text-white shadow-lg" id="navbar">
            <div className="mx-auto px-4 flex h-15">
               <div className="flex items-center">
                  <Link to="/" className="text-xl font-bold">
                     Civic-AId
                  </Link>
               </div>
            </div>
         </nav>
      )
   }

   return (
      <nav className="bg-blue-600 text-white shadow-lg" id="navbar">
         <div className="mx-auto px-4 flex h-15">
            <div className="flex items-center">
               <Link to="/" className="text-xl font-bold">
                  Civic-AId
               </Link>
            </div>

            {user &&
               <div className="flex items-center justify-between px-10 space-x-10 text-gray-300">

                  <Link
                     to="/chatbot"
                     className={`hover:text-white transition ${pathname === "/chatbot" ? "text-white" : ""}`}
                  >
                     Chatbot
                  </Link>

                  <Link
                     to="/profile"
                     className={`hover:text-white transition ${pathname === "/profile" ? "text-white" : ""}`}
                  >
                     Profile
                  </Link>

               </div>
            }

            <div className="flex ms-auto items-center space-x-3">
               {user
               ?  <>
                     <div>
                        Welcome, <strong>{user.userName}</strong>
                     </div>
                     <LogoutButton/>
                  </>
               :  <button
                     onClick={() => navigate("/auth")}
                     className="btn btn-sm btn-outline"
                  >
                     Log In
                  </button>
               }
            </div>

         </div>
      </nav>
   );
}

function LogoutButton() {

   const navigate = useNavigate();
   const queryClient = useQueryClient();

   async function logoutHandler() {

      console.log("Logging user out...");

      try {
         await axios.post(`${SERVER_API_URL}/api/logout`, {}, { withCredentials: true });

         queryClient.removeQueries({ queryKey: ['current-user'] })

         console.log("Log out successful");

         toast.success("You successfully logged out");

         navigate("/");

      } catch (error) {

         console.log(`Log out unsuccessful due to: \n${error}`);

         if (axios.isAxiosError(error)) {
            toast.error(`Logout failed: ${error.message}.`);
         } else {
            toast.error("An unknown error occured. Try again later.");
         }
      }

   };

   return (
      <button
         onClick={logoutHandler}
         className="btn btn-sm btn-outline"
      >
         Log Out
      </button>
   )
}