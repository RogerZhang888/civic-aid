import ReportCard from "../profile/ReportCard";
import useReports from "../../hooks/useReports";

export default function CommunityPage() {
   const { data: reports, isLoading: isReportsLoading } = useReports("/reports/public");

   // const now = new Date();
   // const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
   // const formatted = [
   // lastDay.getFullYear(),
   // String(lastDay.getMonth() + 1).padStart(2, '0'),
   // String(lastDay.getDate()).padStart(2, '0')
   // ].join('-');

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4">
         <div className="text-2xl font-semibold">Community</div>

         {isReportsLoading ? (
            <div>Loading reports...</div>
         ) : reports?.length === 0 || !reports ? (
            <div>There are no public reports.</div>
         ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">

               {reports.map((report) => (
                  <ReportCard
                     key={report.id}
                     report={report}
                  />
               ))}

            </div>

         )}

      

      </section>
   );
}