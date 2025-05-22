import { Navigate, Outlet } from "react-router-dom";
import useUser from "../../hooks/useUser";
import GenericLoading from "../GenericLoading";

export default function AuthRoutesWrapper() {

   const { isLoading, isError } = useUser();

   console.log("Trying to access routes under /auth...");

   if (isLoading) return <GenericLoading str="Loading auth..."/>

   if (isError) {
      console.log("User is not logged in, can access /auth");
      return (
         <div className="h-full flex items-center justify-center">
            <Outlet/>
         </div>
      )
   };

   console.log("User is logged in, cannot access /auth");

   return <Navigate to="/" />;
}