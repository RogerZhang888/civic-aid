import { DataGrid } from '@mui/x-data-grid';
import { ReportSummary } from '../types';
import CustomToolbar from './CustomToolbar';
import summaryColumns from './summaryColumns';

export default function AdminSummariesTable({ summaries }: { summaries: ReportSummary[] }) {

   return (
      <DataGrid<ReportSummary>
         rows={summaries}
         columns={summaryColumns}
         getRowHeight={() => 'auto'}
         initialState={{
            pagination: {
               paginationModel: { pageSize: 20, page: 0 },
            },
            columns: {
               columnVisibilityModel: {
                  agency: false
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
         slots={{ toolbar: CustomToolbar }}
         getRowId={(row) => `${row.title} - ${row.agency}`}
         localeText={{
            noRowsLabel: 'No summaries to display.'
         }}
         showToolbar
      />
   )
}
