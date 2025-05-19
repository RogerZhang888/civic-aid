import { Navigate, Outlet } from "react-router-dom";
import useUser from "../../hooks/useUser";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoutesWrapper() {
   
   const { isLoading, isError } = useUser();

   console.log("Trying to access a protected route...")

   if (isLoading) return <LoadingSpinner/>;

   if (isError) {
      console.log("User is not logged in, cannot access protected routes");
      return <Navigate to="/auth" />
   }

   console.log("User is logged in, can access protected routes");
   return <Outlet />;
}