import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
   return (
      <section className="h-screen flex flex-col" data-theme="light" id="main-layout-container">
         <Navbar/>
         <article className="flex-1 min-h-0" id="main-outlet">
            <Outlet />
         </article>
      </section>
   );
}
