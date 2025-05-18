import { useParams } from 'react-router';
import useReports from '../profile/useReports';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function CommunityReportPage() {
   const { reportId } = useParams() as { reportId: string };
   const { data: reports, isLoading: isReportsLoading } = useReports();

   if (isReportsLoading) return <div className="flex justify-center items-center h-64">Loading your report...</div>;

   const thisReport = reports!.find(report => report.id === reportId);

   if (!thisReport) return <div className="alert alert-error mt-4">This report does not exist!</div>;

   // Format dates for display
   const createdAt = new Date(thisReport.createdAt).toLocaleString();
   const resolvedAt = thisReport.resolvedAt ? new Date(thisReport.resolvedAt).toLocaleString() : 'Not resolved yet';

   // Status badge color
   const statusColor = thisReport.status === 'resolved' ? 'badge-success' : 'badge-warning';

   function capitalize(word: string) {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
   }

   return (
      <div className="card bg-base-100 m-10 shadow-[0_0_10px_1px_rgba(0,0,0,0.2)]">
         <div className="card-body text-base">

            <h1 className="card-title text-3xl">{thisReport.title}</h1>

            <div className="divider"/>

            <div className="max-w-100">
               
               <h2 className="text-xl font-semibold mb-2">Details</h2>
               <div className="space-y-3">
                  <div className="flex justify-between">
                     <span className="font-medium">Status:</span>
                     <span className={`badge ${statusColor} p-3`}>{capitalize(thisReport.status)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="font-medium">Created:</span>
                     <span>{createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="font-medium">Resolved:</span>
                     <span>{resolvedAt}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="font-medium">Agency:</span>
                     <span>{thisReport.agency}</span>
                  </div>
               </div>

            </div>

            <div className="divider"/>

            <div>
               <h2 className="text-xl font-semibold mb-2">Location</h2>
               {thisReport.incidentLocation 
                  ?  <div className="whitespace-pre-line bg-base-200 p-4 rounded-lg">
                        <p><span className="font-medium">Latitude:</span> {thisReport.incidentLocation.latitude}</p>
                        <p><span className="font-medium">Longitude:</span> {thisReport.incidentLocation.longitude}</p>
                     </div>  
                  :  "No location data for this report."
               }
            </div>

            <div className="divider"/>

            <div>
               <h2 className="text-xl font-semibold mb-2">Description</h2>
               <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.description}</p>
            </div>

            {thisReport.recommended_steps && (
               <>
                  <div className="divider"/>
                  <div>
                     <h2 className="text-xl font-semibold mb-2">Recommended Steps</h2>
                     <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.recommended_steps}</p>
                  </div>
               </>
            )}

            <div className="divider"/>
            <div>
               <h2 className="text-xl font-semibold mb-2">Attached Media</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {thisReport.mediaUrl.length > 0
                     ?  thisReport.mediaUrl.map((url, index) => (
                           <div key={index} className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                              <img
                                 src={`${SERVER_API_URL}/api/files/${url}`}
                                 alt={`Report media ${index + 1}`}
                                 className="w-full h-full object-cover"
                              />
                           </div>
                        ))
                     :  "You did not upload any media for this report."
                  }
               </div>
            </div>

         </div>
      </div>
   );
}

