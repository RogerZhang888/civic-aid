import useTranslation from "../language/useTranslation";
import CardSection from "./CardSection";

export default function About() {

   const { t } = useTranslation();

   return (
      <div className="p-8 flex flex-col items-center bg-base-100 relative z-0 space-y-10">
         <div
            className="fixed inset-0 z-[-1] bg-no-repeat bg-cover bg-center bg-fixed opacity-20"
            style={{ backgroundImage: "url('/heartland.avif')" }}
         />
         <CardSection imageAlt="Leo waving">
            {t('about1')}
         </CardSection>

         <CardSection imageAlt="Leo reporting issues" reverse>
            {t('about2')}
         </CardSection>

         <CardSection imageAlt="Leo explaining features">
            {t('about3')}
         </CardSection>

         <CardSection imageAlt="Leo celebrating" reverse>
            {t('about4')}
         </CardSection>

         <CardSection imageAlt="Leo ready to help">
            {t('about5')}
         </CardSection>
      </div>
   );
}
