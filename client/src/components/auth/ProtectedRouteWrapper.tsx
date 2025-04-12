import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./AuthContext";
import useAuthCheck from "./useAuthCheck";

export default function ProtectedRouteWrapper() {
   const { data, isLoading, isError } = useAuthCheck();
   const { addUserState, removeUserState } = useAuth();

   if (isLoading) return <div>AUTH LOADING...</div>;

   // isError = true if unauthorised / invalid token
   // in that case, remove user object if any
   // redirect to login page (/auth)
   if (isError) {
      removeUserState();
      return <Navigate to="/auth" />;
   }

   // else, means authorised & valid token
   // continue to children (protected routes)
   return <Outlet />;
}
