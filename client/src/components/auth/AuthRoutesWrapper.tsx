import { Navigate, Outlet } from "react-router-dom";
import useUser from "./useUser";

export default function AuthRoutesWrapper() {

   const { isLoading, isError } = useUser();

   console.log("Trying to access routes under /auth...");

   if (isLoading) return <div>LOADING....</div>;

   if (isError) {
      console.log("User is not logged in, can access /auth");
      return <Outlet/>
   };

   console.log("User is logged in, cannot access /auth");

   return <Navigate to="/" />;
}