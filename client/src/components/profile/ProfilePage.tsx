import ReportCard from "./ReportCard";
import useReports from "./useReports";
import useRewards from "./useRewards";

export default function ProfilePage() {
   const { data: reports, isLoading: isReportsLoading } = useReports();
   const { data: hasReward, isLoading: isRewardsLoading } = useRewards();

   const resolvedCount = reports?.filter(report => report.status === 'resolved').length || 0;

   const badgeThresholds = [1, 10, 50, 100];

   const earnedBadges = badgeThresholds.filter(threshold => resolvedCount >= threshold);

   const now = new Date();
   const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
   const formatted = [
   lastDay.getFullYear(),
   String(lastDay.getMonth() + 1).padStart(2, '0'),
   String(lastDay.getDate()).padStart(2, '0')
   ].join('-');

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

         <div className="mt-10 text-2xl font-semibold">Your Badges</div>

         <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl">
            {earnedBadges.length > 0
               ? <>
                  {earnedBadges.map(threshold =>
                     <div key={threshold} className="badge-card flex flex-col items-center p-4 bg-base-200 rounded-lg shadow">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                           <img src={`/badge${threshold}.jpg`} />
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
               : <div className="text-gray-500">
                  No badges yet. You'll earn badges when your reports are resolved.
               </div>
            }
         </div>

         <div className="mt-10 text-2xl font-semibold">Your Rewards</div>

         <div className="flex justify-center w-full max-w-4xl">
            {isRewardsLoading ? (
               <div className="text-center">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-2 text-gray-500">Checking rewards...</p>
               </div>
            ) : hasReward ? (
               <div className="card w-full max-w-3xl bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
                  <div className="card-body items-center text-center">
                     <h2 className="card-title text-2xl mb-2">🎉 Congratulations! 🎉</h2>
                     <p>You've earned a reward this month for your contributions!</p>
                     <figure className="px-10 pt-4">
                        <img
                           src="/foodVoucher.jpg"
                           alt="Food Voucher"
                           className="rounded-xl border-2 border-white object-cover"
                        />
                     </figure>
                     <div className="badge badge-accent mt-4 gap-2 p-4 text-lg font-semibold">
                        Valid until {formatted}!
                     </div>
                  </div>
               </div>
            ) : (
               <div className="card w-full max-w-md bg-base-200 shadow-xl">
                  <div className="card-body items-center text-center">
                     <h2 className="card-title text-2xl mb-2">No Reward This Month 😢</h2>
                     <p>You haven't qualified for a reward this month.</p>
                     <p>Keep submitting reports to earn rewards!</p>
                  </div>
               </div>
            )}
         </div>

      </section>
   );
}