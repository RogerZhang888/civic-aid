import useUser from "../auth/useUser";
import ReportCard from "./ReportCard";
import useReports from "./useReports";

export default function ProfilePage() {
   const { data: user, isLoading: isUserLoading } = useUser();
   const { data: reports, isLoading: isReportsLoading } = useReports();

   if (isUserLoading) return <div>Loading your data...</div>;

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4">
         <div className="text-2xl font-semibold">{user?.username}'s Reports</div>

         {isReportsLoading ? (
            <div>Loading reports...</div>
         ) : reports?.length === 0 || !reports ? (
            <div>You do not have any reports.</div>
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