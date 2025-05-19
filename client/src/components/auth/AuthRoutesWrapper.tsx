import { Navigate, Outlet } from "react-router-dom";
import useUser from "./useUser";

export default function AuthRoutesWrapper() {

   const { isLoading, isError } = useUser();

   console.log("Trying to access routes under /auth...");

   if (isLoading) return (
      <section className="h-full flex flex-1 flex-col justify-center items-center space-y-2">
         <span className="loading loading-spinner loading-xl"/>
         <div className="text-xl">Loading...</div>
      </section>
   )

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