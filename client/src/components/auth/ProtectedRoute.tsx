import { useAuth } from "./AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "./useAuthCheck";

export default function ProtectedRoute() {
   const { currUser } = useAuth();
   const { data, isLoading, isError } = useAuthCheck();

   if (isLoading) return <div>AUTH LOADING...</div>;

   if (isError || !data?.authenticated) {
      return <Navigate to="/auth" />;
   }

   console.log(`User ${currUser.email} has logged in and is accessing protected route`);

   return <Outlet />;
}
