import useTranslation from "../language/useTranslation";
import CardSection from "./CardSection";

import mascot from "/mascot.png";
import mascot1 from "/mascot1.png";
import mascot2 from "/mascot2.png";

export default function About() {
   const { t } = useTranslation();

   return (
      <div className="min-h-screen p-8 flex flex-col items-center bg-base-100 relative z-0 space-y-10">
         <div
            className="fixed inset-0 z-[-1] bg-no-repeat bg-cover bg-center bg-fixed opacity-20"
            style={{ backgroundImage: "url('/heartland.avif')" }}
         />

         <CardSection imageSrc={mascot} imageAlt="Leo waving">
            {t('about1')}
         </CardSection>

         <CardSection imageSrc={mascot1} imageAlt="Leo reporting issues" reverse>
            {t('about2')}
         </CardSection>

         <CardSection imageSrc={mascot} imageAlt="Leo explaining features">
            {t('about3')}
         </CardSection>

         <CardSection imageSrc={mascot2} imageAlt="Leo celebrating" reverse>
            {t('about4')}
         </CardSection>

         <CardSection imageSrc={mascot} imageAlt="Leo ready to help">
            {t('about5')}
         </CardSection>
      </div>
   );
}
