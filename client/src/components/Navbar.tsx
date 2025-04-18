import { Link, useLocation, useNavigate } from "react-router-dom";
import useUser from "./auth/useUser";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { AlignJustify } from "lucide-react";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();

   const { data: user, isLoading } = useUser();

   if (isLoading) {
      return (
         <div className="navbar shadow-sm bg-primary text-primary-content">
            <Link to="/" className="btn btn-ghost text-2xl">
               Civic-AId
            </Link>
         </div>
      );
   }

   return (
      <div className="navbar shadow-sm bg-primary text-primary-content px-4">
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
                           Profile
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/chatbot"
                        >
                           Chatbot
                        </Link>
                     </li>
                  </ul>
               </div>
            }

            <Link to="/" className="text-2xl font-bold">
               Civic-AId
            </Link>

            {user && (
               <div className="hidden lg:flex">
                  <ul className="menu menu-horizontal px-4 space-x-2">
                     <li>
                        <Link
                           to="/profile"
                           className={`hover:text-white transition ${
                              pathname === "/profile" ? "text-gray-400" : ""
                           }`}
                        >
                           Profile
                        </Link>
                     </li>
                     <li>
                        <Link
                           to="/chatbot"
                           className={`hover:text-white transition ${
                              pathname === "/chatbot" ? "text-gray-400" : ""
                           }`}
                        >
                           Chatbot
                        </Link>
                     </li>
                  </ul>
               </div>
            )}
         </div>

         <div className="navbar-end">
            {user ? (
               <div className="flex flex-row items-center space-x-4">
                  <div>
                     Welcome, <strong>{user.userName}</strong>
                  </div>
                  <LogoutButton />
               </div>
            ) : (
               <button
                  onClick={() => navigate("/auth")}
                  className="btn btn-sm btn-outline"
               >
                  Log In
               </button>
            )}
         </div>
      </div>
   );
}

function LogoutButton() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   async function logoutHandler() {
      console.log("Logging user out...");

      try {
         await axios.post(
            `${SERVER_API_URL}/api/logout`,
            {},
            { withCredentials: true }
         );

         queryClient.removeQueries({ queryKey: ["current-user"] });

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
   }

   return (
      <button onClick={logoutHandler} className="btn btn-sm btn-outline">
         Log Out
      </button>
   );
}
