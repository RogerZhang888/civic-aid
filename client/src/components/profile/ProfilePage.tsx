import ReportCard from "./ReportCard";
import useReports from "./useReports";

export default function ProfilePage() {
   const { data: reports, isLoading: isReportsLoading } = useReports();

   const resolvedCount = reports?.filter(report => report.status === 'resolved').length || 0;

   const badgeThresholds = [1, 10, 50, 100];

   const earnedBadges = badgeThresholds.filter(threshold => resolvedCount >= threshold);

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4">
         <div className="text-2xl font-semibold">Your Reports</div>

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

         <div className="text-2xl font-semibold">Your Badges</div>

         <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl">
            {earnedBadges.length > 0 
               ?  <>
                     {earnedBadges.map(threshold =>
                        <div key={threshold} className="badge-card flex flex-col items-center p-4 bg-base-200 rounded-lg shadow">
                           <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                              <img src={`/badge${threshold}.jpg`}/>
                           </div>
                           <span className="font-semibold">
                              {threshold === 1 ? "First Issue Resolved!" : `${threshold} Issues Resolved!`}
                           </span>
                           <span className="text-sm text-gray-500">
                              {resolvedCount >= threshold && `Earned on ${new Date().toLocaleDateString()}`}
                           </span>
                        </div>
                     )}

                     {resolvedCount < 100 &&
                        <div className="badge-card flex flex-col items-center p-4 bg-base-200 rounded-lg shadow opacity-60">
                           <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                              <span className="text-2xl">🔒</span>
                           </div>
                           <span className="font-semibold">
                              {badgeThresholds.find(t => t > resolvedCount) || 100} Issues
                           </span>
                           <span className="text-sm text-gray-500">
                              {resolvedCount}/{badgeThresholds.find(t => t > resolvedCount) || 100} resolved
                           </span>
                           <progress
                              className="progress progress-primary w-24 mt-2"
                              value={resolvedCount}
                              max={badgeThresholds.find(t => t > resolvedCount) || 100}
                           ></progress>
                        </div>
                     }
                  </>
               :  <div className="text-gray-500">
                     No badges yet. Resolve reports to earn badges!
                  </div>
            }
         </div>

      </section>
   );
}