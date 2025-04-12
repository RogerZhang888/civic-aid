import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "./auth/AuthContext";

export default function Navbar() {
   const { pathname } = useLocation();
   const { currUser } = useAuth();
   const navigate = useNavigate();

   return (
      <nav className="bg-blue-600 text-white shadow-lg" id="navbar">
         <div className="mx-auto px-4 flex h-15">
            <div className="flex items-center">
               <Link to="/" className="text-xl font-bold">
                  Civic-AId
               </Link>
            </div>

            {currUser &&
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

            <div className="flex ms-auto items-center">
               {currUser
               ?  <button
                     className="btn btn-sm btn-outline"
                  >
                     Log Out
                  </button>
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

/**
 *                   <Link
                     to="/auth"
                     className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/auth"
                           ? "bg-gray-900 text-white"
                           : "hover:bg-gray-700 hover:text-white"
                     }`}
                  >
                     Login
                  </Link>
 */
