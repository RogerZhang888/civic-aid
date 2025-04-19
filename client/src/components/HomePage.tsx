import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "./auth/useUser.ts";

export default function HomePage() {
   const navigate = useNavigate();
   const { data: user, isLoading } = useUser();

   useEffect(() => {
      if (!isLoading && user) {
         navigate("/chatbot");
      }
   }, [user, isLoading, navigate]);


   return (
      <section className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
         <img src="/mascot.png" alt="logo" className="w-50" />
         <div className="text-primary text-3xl">Welcome to CivicAId!</div>
         <button
            onClick={() => navigate("/auth")}
            className=" mt-5 btn btn-lg btn-outline bg-primary text-primary-content hover:bg-primary/80"
         >
            Log In
         </button>
      </div>
      </section>

      
   );
}
