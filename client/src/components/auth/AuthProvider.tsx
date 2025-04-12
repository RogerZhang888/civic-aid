import { useState } from "react";
import { User } from "../types";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
   const [currUser, setCurrUser] = useState<User | null>(null);

   function handleAddUserState(u: User) {
      setCurrUser(u);
   }

   function handleRemoveUserState() {
      setCurrUser(null);
   }

   // useEffect(() => {
   //    // this runs ONCE when AuthProvider mounts
   //    // doesn't re-run when the user navigates to another route

   //    const checkAuth = async () => {
   //       try {
   //          await axios.get("http://localhost:5000/api/protected", { withCredentials: true });
   //       } catch (error) {
   //          console.error("Auth check failed:", error);
   //          setCurrUser(null);
   //       } finally {
   //          setLoading(false);
   //       }
   //    };

   //    checkAuth();
   // }, []);

   // async function cvaLogout() {
   //    try {
   //       await axios.post(`${SERVER_URL}/api/logout`, {}, { withCredentials: true });
   //       // set currUser state to null
   //       setCurrUser(null);
   //       // Redirect back to home page
   //       navigate("/");
   //       return;

   //    } catch (error) {
   //       toast.error("Logout failed:", error);
   //    }
   // };

   return (
      <AuthContext.Provider 
         value={{
            currUser,
            handleRemoveUserState,
            handleAddUserState
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};