import { useNavigate } from "react-router";
import useUser from "../../hooks/useUser";
import useTranslation from "../../hooks/useTranslation";
import AboutCard from "./AboutCard";

import mascot from "/mascot.png";
import mascot1 from "/mascot1.png";
import mascot2 from "/mascot2.png";

export default function About() {
   const { t } = useTranslation();

   const { data: user } = useUser();

   const navigate = useNavigate();

   return (
      <div className="min-h-screen p-8 flex flex-col items-center bg-base-100 relative z-0 space-y-10">
  <div className="fixed inset-0 z-[-1] opacity-20">
    <img
      src="/heartland.avif"
      alt="background"
      className="absolute h-full w-full object-cover object-center"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        top: 0,
        left: 0,
      }}
    />
  </div>

         <AboutCard imageSrc={mascot} imageAlt="Leo waving">
            {t('about1')}
         </AboutCard>

         <AboutCard imageSrc={mascot1} imageAlt="Leo reporting issues" reverse>
            {t('about2')}
         </AboutCard>

         <AboutCard imageSrc={mascot} imageAlt="Leo explaining features">
            {t('about3')}
         </AboutCard>

         <AboutCard imageSrc={mascot2} imageAlt="Leo celebrating" reverse>
            {t('about4')}
         </AboutCard>
         <AboutCard imageSrc={mascot} imageAlt="Leo ready to help">
            {t('about5')}
         </AboutCard>
         <AboutCard imageSrc={mascot} imageAlt="Leo ready to help" reverse>
            {t('about6')}
         </AboutCard>

         {!user &&
            <button 
               className="btn btn-primary text-lg py-8 px-15 mb-5"
               onClick={() => navigate("/auth")}
            >
               Log In to CivicAId
            </button>
         }

      </div>
   );
}
