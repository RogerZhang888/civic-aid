import { Navigate, Outlet } from "react-router-dom";
import useUser from "./user";

export default function ProtectedRouteWrapper() {
   
   const { isLoading, isError } = useUser();

   console.log("Trying to access a protected route...")

   if (isLoading) return <div>LOADING....</div>;

   if (isError) return <Navigate to="/auth" />; // Redirect if unauthorized

   return <Outlet />; // Render protected routes
}