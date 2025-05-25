import ReportCard from "../profile/ReportCard";
import useReports from "../../hooks/useReports";
import useTranslation from "../../hooks/useTranslation";
import { FileX2 } from "lucide-react";

export default function CommunityPage() {

   const { data: reports, isLoading: isReportsLoading } = useReports("/reports/public");
   const { t } = useTranslation();

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="community-page">
         <div className="text-2xl font-semibold">{t('community')}</div>

         {isReportsLoading ? (
            <div className="text-center">
               <div className="loading loading-spinner text-primary"/>
               <div className="mt-2  text-gray-500">{t('loadingReports')}</div>
            </div>
         ) : reports?.length === 0 || !reports ? (
            <div className="flex flex-col space-y-2 items-center">
               <FileX2 className="w-10 h-10 text-red-400" />
               <div className="text-gray-500">{t('noPublicReports')}</div>
            </div>
         ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center pb-4">

               {reports.sort((r1, r2) => r2.createdAt.getTime() - r1.createdAt.getTime()).map((report) => (
                  <ReportCard
                     key={report.id}
                     report={report}
                     loc="/community"
                  />
               ))}

            </div>

         )}

      </section>
   );
}