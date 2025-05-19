import useUser from '../../hooks/useUser';
import useReports from '../../hooks/useReports';
import { DataGrid } from '@mui/x-data-grid';
import { Report } from '../types';
import reportColumns from './reportColumns';

export default function AdminPage() {
   const { data: admin, isLoading: isAdminLoading } = useUser();
   const { data: reports, isLoading: isReportsLoading } = useReports("/gov/reports");

   if (!admin || isAdminLoading || isReportsLoading || !reports) {
      return <div className="w-full h-full flex justify-center items-center">Loading admin panel...</div>;
   }

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="admin-panel">
         <div className="text-2xl font-semibold">Admin Panel</div>
         <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-4xl">
            <div>Logged in as: {admin.username}</div>
            <div>ID: {admin.id}</div>
            <div>Permissions: {admin.permissions.join(', ')}</div>
         </div>

         <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <DataGrid<Report>
               rows={reports}
               columns={reportColumns}
               getRowHeight={() => 'auto'}
               initialState={{
                  pagination: {
                     paginationModel: { pageSize: 100, page: 0 },
                  },
               }}
               pageSizeOptions={[10, 25, 50, 100]}
               sx={{
                  '& .MuiDataGrid-cell': {
                     borderRight: '1px solid #f3f4f6',
                  },
                  '& .MuiDataGrid-columnHeader': {
                     backgroundColor: '#f3f4f6',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                     fontWeight: '600',
                  },
                  '& .MuiDataGrid-footerContainer': {
                     borderTop: '1px solid #f3f4f6',
                     backgroundColor: '#f9fafb',
                  },
               }}
            />
         </div>
      </section>
   );
}