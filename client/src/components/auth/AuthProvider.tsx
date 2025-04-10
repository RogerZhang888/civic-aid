import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { User } from "../types";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [currUser, setCurrUser] = useState<User | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   const navigate = useNavigate();

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const { data } = await axios.get('/api/check-auth', { withCredentials: true });
            if (data.user) {
               setCurrUser(data.user);
            }
         } catch (error) {
            console.error('Auth check failed:', error);
         } finally {
            setLoading(false);
         }
      };

      checkAuth();
   }, []);

   async function cvaLogin(email: string, password: string) {
      try {

         const res = await axios.post("/api/login", 
            { email, password },
            { withCredentials: true }
         );

         const currUser = res.data.user;

         // set currUser state to fetched user data
         setCurrUser(currUser);
         toast.success(`Welcome, ${currUser.name}`);

         // Redirect after successful login
         navigate("/dashboard");

         return { success: true };

      } catch (error) {
         
         console.log(error);

         if (error instanceof AxiosError) {
            toast.error(`Login failed: ${error.message}.`);
         } else {
            toast.error("An unknown error occured. Try again later.");
         }

         return { success: false };
      }
   };

   async function cvaLogout() {
      try {
         await axios.post('/api/logout', {}, { withCredentials: true });
         // set currUser state to null
         setCurrUser(null);
         // Redirect back to home page
         navigate("/");
         return;

      } catch (error) {
         toast.error("Logout failed:", error);
      }
   };

   return (
      <AuthContext.Provider 
         value={{
            currUser,
            loading,
            cvaLogin,
            cvaLogout
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};