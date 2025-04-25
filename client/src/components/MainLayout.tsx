import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
   return (
      <section className="min-h-screen flex flex-col" data-theme="light" id="main-layout-container">
         <Navbar/>
         <article className="flex-1 overflow-y-auto" id="main-outlet">
            <Outlet />
         </article>
      </section>
   );
}
