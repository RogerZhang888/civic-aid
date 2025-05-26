import { useNavigate, useParams } from 'react-router';
import useReports from '../../hooks/useReports';
import AdminReportPageEdit from './AdminReportPageEdit';
import getBadgeClass from '../../hooks/getBadgeClass';
import GenericLoading from '../GenericLoading';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminReportPage() {

   const { reportId } = useParams() as { reportId: string };
   const navigate = useNavigate();
   const { data: reports, isLoading: isReportsLoading } = useReports("/gov/reports");

   if (isReportsLoading) return <GenericLoading str="Loading report..." />;

   const thisReport = reports!.find(report => report.id === reportId);

   if (!thisReport) return (
      <div className="w-full h-full flex flex-col space-y-3 justify-center items-center">
         <div className='text-lg font-semibold'>
            Error: Either this report does not exist, or you are not authorised to view it.
         </div>
         <button className='btn btn-lg btn-primary ml-5' onClick={() => navigate("/admin")}>
            Back to Admin Page
         </button>
      </div>
   );

   function capitalize(word: string) {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
   }

   return (
      <div className='p-6 max-w-250 mx-auto'>

         <button className='btn btn-primary mb-5' onClick={() => navigate("/admin")}>
            Back to Admin Page
         </button>

         <div className="card shadow-[0_0_10px_1px_rgba(0,0,0,0.2)] ">
            <div className="card-body">

               <h1 className="mb-3 card-title text-3xl">{thisReport.title}</h1>p

               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {thisReport.mediaUrl.length > 0
                     ? thisReport.mediaUrl.map((url, index) => (
                        <div key={index} className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                           <img
                              src={`${SERVER_API_URL}/api/files/${url}`}
                              alt={`Report media ${index + 1}`}
                              className="w-full h-full object-cover"
                           />
                        </div>
                     ))
                     : "No media was submitted for this report."
                  }
               </div>

               <div className="divider" />

               <h2 className="text-2xl font-semibold mb-2">Details</h2>

               <table className='table'>
                  <tbody>
                     <tr>
                        <th>Report ID</th>
                        <td>{thisReport.id}</td>
                     </tr>
                     <tr>
                        <th>User ID</th>
                        <td>{thisReport.userId}</td>
                     </tr>
                     <tr>
                        <th>Chat ID</th>
                        <td>{thisReport.chatId}</td>
                     </tr>
                     <tr>
                        <th>Title</th>
                        <td>{thisReport.title}</td>
                     </tr>
                     <tr>
                        <th>Description</th>
                        <td>{thisReport.description}</td>
                     </tr>
                     <tr>
                        <th>Incident Address</th>
                        <td>{thisReport.incidentAddress ?? "No address provided"}</td>
                     </tr>
                     <tr>
                        <th>Agency</th>
                        <td>{thisReport.agency}</td>
                     </tr>
                     <tr>
                        <th>Recommended Steps</th>
                        <td>{thisReport.recommendedSteps}</td>
                     </tr>
                     <tr>
                        <th>Urgency</th>
                        <td>
                           <progress className="progress w-56" value={thisReport.urgency*100} max="100" />
                           <span className='ml-3'>{thisReport.urgency*100} / 100</span>
                        </td>
                     </tr>
                     <tr>
                        <th>Confidence</th>
                        <td>
                           <progress className="progress w-56" value={thisReport.reportConfidence*100} max="100" />
                           <span className='ml-3'>{thisReport.reportConfidence*100} / 100</span>
                        </td>
                     </tr>
                     <tr>
                        <th>Status</th>
                        <td>
                           <span className={`badge ${getBadgeClass(thisReport.status)} p-3`}>
                              {capitalize(thisReport.status)}
                           </span>
                        </td>
                     </tr>
                     <tr>
                        <th>Is Public?</th>
                        <td>{thisReport.isPublic ? "Yes" : "No"}</td>
                     </tr>
                     <tr>
                        <th>Created at</th>
                        <td>{new Date(thisReport.createdAt).toLocaleString()}</td>
                     </tr>
                     <tr>
                        <th>Resolved at</th>
                        <td>{thisReport.resolvedAt ? new Date(thisReport.resolvedAt).toLocaleString() : "Not resolved yet"}</td>
                     </tr>
                     <tr>
                        <th>Remarks</th>
                        <td>{thisReport.remarks ?? "No remarks"}</td>
                     </tr>
                     <tr>
                        <th>Upvote Count</th>
                        <td>{thisReport.upvoteCount}</td>
                     </tr>
                  </tbody>
               </table>

               <div className="divider" />

               <h2 className="text-2xl font-semibold mb-2">Edit this report</h2>

               <AdminReportPageEdit report={thisReport}/>

            </div>

         </div>

      </div>
   );
}