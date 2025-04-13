import { Outlet } from "react-router-dom";
import useAuthCheck from "./useAuthCheck";

export default function AuthRoutesWrapper() {

   const { data, isLoading, isError } = useAuthCheck();

   return (
      <section className="h-full flex justify-center items-center" id="auth-layout">
         <Outlet />
      </section>
   );
}
