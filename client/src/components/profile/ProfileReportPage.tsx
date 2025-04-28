import { useParams } from 'react-router';
import useReports from './useReports';

export default function ProfileReportPage() {
   const { reportId } = useParams() as { reportId: string };
   const { data: reports, isLoading: isReportsLoading } = useReports();

   if (isReportsLoading) return <div className="flex justify-center items-center h-64">Loading your report...</div>;

   const thisReport = reports!.find(report => report.id === reportId);

   if (!thisReport) return <div className="alert alert-error mt-4">This report does not exist!</div>;

   // Format dates for display
   const createdAt = new Date(thisReport.createdAt).toLocaleString();
   const resolvedAt = thisReport.resolvedAt ? new Date(thisReport.resolvedAt).toLocaleString() : 'Not resolved yet';

   // Urgency indicator color
   const urgencyColor = thisReport.urgency >= 7 ? 'badge-error' :
      thisReport.urgency >= 4 ? 'badge-warning' : 'badge-success';

   // Status badge color
   const statusColor = thisReport.status === 'resolved' ? 'badge-success' : 'badge-warning';

   return (
      <div className="container mx-auto p-4 max-w-4xl">
         <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
               <h1 className="card-title text-3xl mb-4">{thisReport.title}</h1>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <h2 className="text-xl font-semibold mb-2">Details</h2>
                     <div className="space-y-2">
                        <p><span className="font-medium">Status:</span> <span className={`badge ${statusColor}`}>{thisReport.status}</span></p>
                        <p><span className="font-medium">Created:</span> {createdAt}</p>
                        <p><span className="font-medium">Resolved:</span> {resolvedAt}</p>
                        <p><span className="font-medium">Agency:</span> {thisReport.agency}</p>
                        <p><span className="font-medium">Urgency:</span> <span className={`badge ${urgencyColor}`}>{thisReport.urgency}/10</span></p>
                        <p><span className="font-medium">Confidence:</span> <progress className="progress progress-primary w-24" value={thisReport.reportConfidence} max="1"></progress> {thisReport.reportConfidence}</p>
                     </div>
                  </div>

                  {thisReport.incidentLocation && (
                     <div>
                        <h2 className="text-xl font-semibold mb-2">Location</h2>
                        <div className="bg-gray-100 p-3 rounded-lg">
                           <p><span className="font-medium">Latitude:</span> {thisReport.incidentLocation.latitude}</p>
                           <p><span className="font-medium">Longitude:</span> {thisReport.incidentLocation.longitude}</p>
                           <p><span className="font-medium">Accuracy:</span> {thisReport.incidentLocation.accuracy} meters</p>
                        </div>
                     </div>
                  )}
               </div>

               <div className="divider"></div>

               <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.description}</p>
               </div>

               {thisReport.recommended_steps && (
                  <>
                     <div className="divider"></div>
                     <div>
                        <h2 className="text-xl font-semibold mb-2">Recommended Steps</h2>
                        <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.recommended_steps}</p>
                     </div>
                  </>
               )}

               {thisReport.mediaUrl.length > 0 && (
                  <>
                     <div className="divider"></div>
                     <div>
                        <h2 className="text-xl font-semibold mb-2">Media</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {thisReport.mediaUrl.map((url, index) => (
                              <div key={index} className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                                 <img
                                    src={url}
                                    alt={`Report media ${index + 1}`}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}