import useUser from "../auth/useUser";
import useReports from "./useReports";

export default function ProfilePage() {

   const { data: user, isLoading: isUserLoading } = useUser();
   const { data: reports, isLoading: isReportsLoading } = useReports();

   if (isUserLoading) return <div>Loading your data...</div>

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4">
         <div className="text-xl font-bold">{user?.username}'s Reports</div>

         {isReportsLoading 
            ?  <div>Loading reports...</div>
            :  reports?.length === 0 
               ? <div>No reports found.</div> 
               : <div>
                  {reports?.map((report) => (
                     <div key={report.id} className="mb-4">
                        {JSON.stringify(report, null, 3)}
                     </div>
                  ))}
               </div>
         }
         
      </section>
   );
}
