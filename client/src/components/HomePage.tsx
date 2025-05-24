import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser.ts";
import useTranslation from "../hooks/useTranslation.ts";

export default function HomePage() {
   const navigate = useNavigate();
   const { data: user, isLoading } = useUser();
   const { t } = useTranslation();

   useEffect(() => {
      if (!isLoading && user) {
         navigate(user.permissions.length === 0 ? "/chatbot" : "/admin");
      }
   }, [user, isLoading, navigate]);

   return (
      <section className="w-full h-[calc(100vh-4rem)] flex justify-center items-center">
         <div className="flex flex-col items-center space-y-4">
            <img src="/mascot.png" alt="logo" className="w-50" />
            <div className="text-primary text-3xl">{t('homePg')}</div>
            <button
               onClick={() => navigate("/auth")}
               className=" mt-5 btn btn-lg btn-outline bg-primary text-primary-content hover:bg-primary/80"
            >
               {t('login')}
            </button>
         </div>
      </section>
   );
}
