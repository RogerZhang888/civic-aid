import { useNavigate, useParams } from 'react-router';
import useReports from '../../hooks/useReports';
import { useState } from 'react';
import axios from "axios";
import NotFoundPage from '../NotFoundPage';
import getBadgeClass from '../../hooks/getBadgeClass';
import toast from 'react-hot-toast';
import GenericLoading from '../GenericLoading';
import useTranslation from '../../hooks/useTranslation';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

type ReportVisibilityToggleProps = {
   reportId: string;
   initialPublic: boolean;
};

function capitalize(word: string) {
   if (!word) return '';
   return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function ProfileReportPage() {
   const { reportId } = useParams() as { reportId: string };
   const { data: reports, isLoading: isReportsLoading } = useReports();
   const navigate = useNavigate();
   const { t } = useTranslation();

   if (isReportsLoading) return <GenericLoading str='Loading your report...'/>;

   const thisReport = reports!.find(report => report.id === reportId);

   if (!thisReport) return <NotFoundPage />;

   // Format dates for display
   const createdAt = new Date(thisReport.createdAt).toLocaleString();
   const resolvedAt = thisReport.resolvedAt ? new Date(thisReport.resolvedAt).toLocaleString() : 'Not resolved yet';

   return (
      <div className='m-10'>

         <button className='btn btn-primary mb-5' onClick={() => navigate("/profile")}>
            {t("backToProfile")}
         </button>

         <div className="card shadow-[0_0_10px_1px_rgba(0,0,0,0.2)] ">
            <div className="card-body">

               <h1 className="mb-3 card-title text-3xl">{thisReport.title}</h1>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                     <div className="flex justify-between">
                        <span className="font-medium">{t('status')}</span>
                        <span className={`badge ${getBadgeClass(thisReport.status)} p-3`}>{capitalize(t(thisReport.status) as string)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="font-medium">{t('visibility')}</span>
                        <ReportVisibilityToggle
                           reportId={thisReport.id}
                           initialPublic={thisReport.isPublic ?? false}
                        />
                     </div>
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

            </div>
         </div>
      </div>
   );
}

function ReportVisibilityToggle({ reportId, initialPublic }: ReportVisibilityToggleProps) {
   const [isPublic, setIsPublic] = useState(initialPublic);
   const [loading, setLoading] = useState(false);
   const { t } = useTranslation();

   const handleToggle = async () => {
      const newStatus = !isPublic;
      setLoading(true);
      try {
         console.log(`Attempting to set report ${reportId} to ${newStatus ? 'public' : 'private'}...`);
         await axios.post(`${SERVER_API_URL}/api/reports/set_is_public/${reportId}`,
            { is_public: newStatus },
            { withCredentials: true }
         );
         setIsPublic(newStatus); // Update UI only after success
         toast.success(`Your report was updated to be ${newStatus ? 'public' : 'private'}.`);
      } catch (err) {
         console.error('Error updating visibility:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex items-center gap-2">
         <input
            type="checkbox"
            checked={isPublic}
            onChange={handleToggle}
            disabled={loading}
            className="toggle toggle-primary"
         />
         <span className="text-sm font-medium">{isPublic ? t('public') : t('private')}</span>
      </div>
   );
}

/**
 * 
 *                   {/* <div className="flex justify-between items-center">
                     <span className="font-medium">Urgency:</span>
                     <div className="flex items-center gap-2">
                        <progress className="progress progress-info w-30" value={thisReport.urgency} max="1"></progress>
                        <span>{thisReport.urgency.toFixed(2)} / 1</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="font-medium">Confidence:</span>
                     <div className="flex items-center gap-2">
                        <progress className="progress progress-primary w-30" value={thisReport.reportConfidence} max="1"></progress>
                        <span>{thisReport.reportConfidence.toFixed(2)} / 1</span>
                     </div>
                  </div>
 */