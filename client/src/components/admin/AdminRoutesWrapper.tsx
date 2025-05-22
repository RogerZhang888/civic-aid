import { Outlet } from "react-router-dom";
import useUser from "../../hooks/useUser";
import LoadingSpinner from "../auth/LoadingSpinner";

export default function AdminRoutesWrapper() {
   
   const { isLoading, data: user } = useUser();

   console.log("Trying to access an admin route...")

   if (isLoading) return <LoadingSpinner/>;

   if (!user || user.permissions.length === 0) {
      console.log("User is not logged in or is not an admin");
      return <div className="w-full h-full flex justify-center items-center text-xl font-semibold">You do not have the appropriate permissions to visit this page!</div>
   }

   console.log("User is an admin");
   return <Outlet />;
}