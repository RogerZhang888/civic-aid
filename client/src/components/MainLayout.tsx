import Navbar from "./Navbar";
import { SquareMenu } from "lucide-react";
import CombinedMobileSidebar from "./CombinedMobileSidebar";

export default function MainLayout({children}: {children: React.ReactNode}) {
   return (
      <section className="h-screen w-screen flex flex-col drawer" data-theme="light" id="main-layout-container">
         <input id="mobile-sidebar" type="checkbox" className="drawer-toggle" />
         {/* Navbar only shown on >=lg */}
         <Navbar />
         <article className="flex-1 overflow-y-auto overflow-x-hidden drawer-content relative" id="main-outlet">
            <label htmlFor="mobile-sidebar" className="btn btn-ghost lg:hidden absolute top-3 left-1 z-10">
               <SquareMenu/>
            </label>
            {children}
         </article>
         {/* Combined sidebar only shown on <lg */}
         <CombinedMobileSidebar/>
      </section>
   );
}
