import { useParams } from 'react-router';
import useReports from './useReports';

export default function ProfileReportPage() {
   const { reportId } = useParams() as { reportId: string };
   const { data: reports, isLoading: isReportsLoading } = useReports();

   if (isReportsLoading) return <div>Loading your report...</div>;

   const thisReport = reports!.find(report => report.id === reportId);

   if (!thisReport) return <div>This report does not exist!</div>;

   return (
      <div>
         {/* details... */}
      </div>
   );
}
