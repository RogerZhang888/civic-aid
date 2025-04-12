import { Outlet } from "react-router-dom";

export default function AuthLayout() {
   return (
      <section className="h-full flex justify-center items-center" id="auth-layout">
         <Outlet />
      </section>
   );
}
