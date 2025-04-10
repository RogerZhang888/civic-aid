import { useAuth } from "./AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
   const { currUser, loading } = useAuth();

   if (loading) return <div>Loading...</div>;

   return currUser ? <Outlet /> : <Navigate to="/login" />;
};
