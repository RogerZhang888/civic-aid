import { Link, useLocation, useNavigate } from "react-router-dom";
import useLogout from "./auth/useLogout";
import useUser from "./auth/user";

export default function Navbar() {
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const logoutHandler = useLogout();

   const { data: user, isLoading, error } = useUser();

   return (
      <nav className="bg-blue-600 text-white shadow-lg" id="navbar">
         <div className="mx-auto px-4 flex h-15">
            <div className="flex items-center">
               <Link to="/" className="text-xl font-bold">
                  Civic-AId
               </Link>
            </div>

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

            <div className="flex ms-auto items-center space-x-3">
               {user
               ?  <>
                     <div>
                        Welcome, <strong>{user.userName}</strong>
                     </div>
                     <button
                        onClick={logoutHandler}
                        className="btn btn-sm btn-outline"
                     >
                        Log Out
                  </button>
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