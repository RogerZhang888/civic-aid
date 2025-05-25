import ReportCard from "../profile/ReportCard";
import useReports from "../../hooks/useReports";
import useTranslation from "../../hooks/useTranslation";

export default function CommunityPage() {

   const { data: reports, isLoading: isReportsLoading } = useReports("/reports/public");
   const { t } = useTranslation();

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="community-page">
         <div className="text-2xl font-semibold">{t('community')}</div>

         {isReportsLoading ? (
            <div>{t('loadingReports')}</div>
         ) : reports?.length === 0 || !reports ? (
            <div>{t('noPublicReports')}</div>
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