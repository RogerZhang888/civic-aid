import { useNavigate, useParams } from 'react-router';
import useReports from '../../hooks/useReports';
import NotFoundPage from '../NotFoundPage';
import getBadgeClass from '../../hooks/getBadgeClass';
import GenericLoading from '../GenericLoading';
import useTranslation from '../../hooks/useTranslation';
import ReportStats from '../community/ReportStats';
import CommentSection from '../community/CommentSection';
import ReportVisToggle from './ReportVisToggle';
import usePublicReports from '../../hooks/usePublicReports';
import { PublicReport, Report } from '../types';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

function capitalize(word: string) {
   if (!word) return '';
   return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function ReportPage({ type }: { type: "profile" | "community" }) {
   const { reportId } = useParams() as { reportId: string };
   const { data: ownReports, isLoading: isOwnReportsLoading } = useReports('/reports');
   const { data: publicReports, isLoading: isPublicReportsLoading } = usePublicReports();
   const navigate = useNavigate();
   const { t } = useTranslation();

   if (isOwnReportsLoading || isPublicReportsLoading) return <GenericLoading str='Loading report...'/>;

   const thisReport: Report | PublicReport | undefined = type === "community" 
      ?  publicReports!.find(report => report.id === reportId)
      :  ownReports!.find(report => report.id === reportId);

   if (!thisReport) return <NotFoundPage />;

   // Format dates for display
   const createdAt = new Date(thisReport.createdAt).toLocaleString();
   const resolvedAt = thisReport.resolvedAt ? new Date(thisReport.resolvedAt).toLocaleString() : 'Not resolved yet';

   return (
      <div className='p-6 max-w-250 mx-auto'>

         <button className='btn btn-primary mb-5' onClick={() => navigate(type === "profile" ? "/profile" : "/community")}>
            {type === "profile" ? t("backToProfile") : t("backToCommunity")}
         </button>

         <div className="card shadow-[0_0_10px_1px_rgba(0,0,0,0.2)] ">
            <div className="card-body">

               <h1 className="mb-3 card-title text-3xl">{thisReport.title}</h1>

               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {thisReport.mediaUrl.length > 0
                     ?  thisReport.mediaUrl.map((url, index) =>
                        <div key={index} className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                           <img
                              src={`${SERVER_API_URL}/api/files/${url}`}
                              alt={`Report media ${index + 1}`}
                              className="w-full h-full object-cover"
                           />
                        </div>
                     )
                     :  t('noMedia')
                  }
               </div>

               <div className="divider" />

               <h2 className="text-2xl font-semibold mb-2">
                  {t('details')}
               </h2>

               <div className='max-w-100'>
                  <div className="space-y-3">
                     {type === "community" &&
                        <div className="flex justify-between">
                           <span className="font-medium">{t('submittedBy')}</span>
                           <span>{(thisReport as PublicReport).username}</span>
                        </div>
                     }
                     <div className="flex justify-between">
                        <span className="font-medium">{t('status')}</span>
                        <span className={`badge ${getBadgeClass(thisReport.status)} p-3`}>{capitalize(t(thisReport.status) as string)}</span>
                     </div>
                     {type === "profile" && 
                        <div className="flex justify-between">
                           <span className="font-medium">{t('visibility')}</span>
                           <ReportVisToggle
                              reportId={thisReport.id}
                              initialPublic={thisReport.isPublic}
                           />
                        </div>
                     }
                     <div className="flex justify-between">
                        <span className="font-medium">{t('createdAt')}</span>
                        <span>{createdAt}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="font-medium">{t('resolvedAt')}</span>
                        <span>{resolvedAt}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="font-medium">{t('agency')}</span>
                        <span>{thisReport.agency}</span>
                     </div>
                  </div>
               </div>

               <div className="divider" />

               <div>
                  <h2 className="text-xl font-semibold mb-2">{t('incidentLocation')}</h2>
                  <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.incidentAddress ?? t('noLocation')}</p>
               </div>

               <div>
                  <h2 className="text-xl font-semibold mb-2">{t('description')}</h2>
                  <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.description}</p>
               </div>

               <div>
                  <h2 className="text-xl font-semibold mb-2">{t('remarks')}</h2>
                  <p className="whitespace-pre-line bg-base-200 p-4 rounded-lg">{thisReport.remarks ?? t('noRemarks')}</p>
               </div>

               {type === "community" && 
                  <>
                     <div className="divider" />
                     <ReportStats /> 
                     <CommentSection reportId={reportId} />
                  </>
               }

            </div>
         </div>
      </div>
   );
}