import useReports from '../../hooks/useReports';
import { DataGrid, QuickFilter, QuickFilterControl, QuickFilterClear, QuickFilterTrigger, Toolbar, ToolbarButton } from '@mui/x-data-grid';
import { styled } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import { Report } from '../types';
import reportColumns from './reportColumns';
import { Search, X } from 'lucide-react';

type OwnerState = {
   expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
   display: 'grid',
   alignItems: 'center',
   marginLeft: 'auto',
});

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
   ({ theme, ownerState }) => ({
      gridArea: '1 / 1',
      width: 'min-content',
      height: 'min-content',
      zIndex: 1,
      opacity: ownerState.expanded ? 0 : 1,
      pointerEvents: ownerState.expanded ? 'none' : 'auto',
      transition: theme.transitions.create(['opacity']),
   }),
);

const StyledTextField = styled(TextField)<{
   ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
   gridArea: '1 / 1',
   overflowX: 'clip',
   width: ownerState.expanded ? 260 : 'var(--trigger-width)',
   opacity: ownerState.expanded ? 1 : 0,
   transition: theme.transitions.create(['width', 'opacity']),
}));

function CustomToolbar() {
   return (
      <Toolbar>
         <StyledQuickFilter>
            <QuickFilterTrigger
               render={(triggerProps, state) => (
                  <Tooltip title="Search" enterDelay={0}>
                     <StyledToolbarButton
                        {...triggerProps}
                        ownerState={{ expanded: state.expanded }}
                        color="default"
                        aria-disabled={state.expanded}
                     >
                        <Search/>
                     </StyledToolbarButton>
                  </Tooltip>
               )}
            />
            <QuickFilterControl
               render={({ ref, ...controlProps }, state) => (
                  <StyledTextField
                     {...controlProps}
                     ownerState={{ expanded: state.expanded }}
                     inputRef={ref}
                     aria-label="Search"
                     placeholder="Search..."
                     size="small"
                     slotProps={{
                        input: {
                           startAdornment: (
                              <InputAdornment position="start">
                                 <Search/>
                              </InputAdornment>
                           ),
                           endAdornment: state.value ? (
                              <InputAdornment position="end">
                                 <QuickFilterClear
                                    edge="end"
                                    size="small"
                                    aria-label="Clear search"
                                    material={{ sx: { marginRight: -0.75 } }}
                                 >
                                    <X/>
                                 </QuickFilterClear>
                              </InputAdornment>
                           ) : null,
                           ...controlProps.slotProps?.input,
                        },
                        ...controlProps.slotProps,
                     }}
                  />
               )}
            />
         </StyledQuickFilter>
      </Toolbar>
   );
}

export default function AdminReportsTable() {

   const { data: reports, isLoading: isReportsLoading } = useReports("/gov/reports");

   if (isReportsLoading || !reports) {
      return <div className="w-full h-full flex justify-center items-center">Loading admin panel...</div>;
   }

   return (
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
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
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
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            '& .MuiDataGrid-columnHeaders': {
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            },
            '& .MuiTablePagination-root': {
               fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            }
         }}
         slots={{ toolbar: CustomToolbar }}
         showToolbar
      />
   )
}
