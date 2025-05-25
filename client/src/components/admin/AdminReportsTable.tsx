import useReports from '../../hooks/useReports';
import { DataGrid } from '@mui/x-data-grid';
import { Report } from '../types';
import reportColumns from './reportColumns';
import CustomToolbar from './CustomToolbar';

export default function AdminReportsTable() {

   const { data: reports, isLoading } = useReports("/gov/reports");

   return (
      <DataGrid<Report>
         rows={reports}
         columns={reportColumns}
         getRowHeight={() => 'auto'}
         initialState={{
            pagination: {
               paginationModel: { pageSize: 20, page: 0 },
            },
            columns: {
               columnVisibilityModel: {
                  id: false,
                  userId: false,
                  description: false,
                  recommendedSteps: false,
                  agency: false,
                  mediaUrl: false,
                  resolvedAt: false,
                  reportConfidence: false,
                  isPublic: false,
                  remarks: false,
               }
            }
         }}
         pageSizeOptions={[20, 50, 100]}
         sx={{
            '& .MuiDataGrid-cell': {
               borderRight: '1px solid #f3f4f6',
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
               minHeight: '60px',
               textAlign: 'center',
               alignContent: 'center',
               fontSize: "1rem",
            },
            '& .MuiDataGrid-columnHeader': {
               backgroundColor: '#f3f4f6',
               fontSize: "1rem",
            },
            '& .MuiDataGrid-columnHeaderTitle': {
               fontWeight: '600',
            },
            '& .MuiDataGrid-footerContainer': {
               borderTop: '1px solid #f3f4f6',
               backgroundColor: '#f9fafb',
            },        
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            '& .MuiDataGrid-columnHeaders': {
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            },
            '& .MuiTablePagination-root': {
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            }
         }}
         slots={{ 
            toolbar: CustomToolbar
         }}
         localeText={{
            noRowsLabel: isLoading || !reports ? 'Loading reports...' : 'No reports to display.'
         }}
         showToolbar
      />
   )
}
