import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ReportSummary } from "../types";
import { Link } from "react-router";

const summaryColumns: GridColDef<ReportSummary>[] = [
   {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
         <div className="text-left">
            {params.value}
         </div>
      )
   },
   {
      field: 'agency',
      headerName: 'Agency',
      type: 'string'
   },
   {
      field: 'recommendedSteps',
      headerName: 'Recommended Steps',
      flex: 2,
      minWidth: 200,
   },
   {
      field: 'urgency',
      headerName: 'Urgency',
      width: 100,
      type: 'number',
      renderCell: (params) => (
         <span className={`px-2 py-1 rounded-full text-sm ${params.value >= 8 ? 'bg-red-100 text-red-800' :
            params.value >= 0.5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
            }`}>
            {params.value}
         </span>
      )
   },
   {
      field: 'confidence',
      headerName: 'Confidence',
      width: 100,
      type: 'number',
      renderCell: (params) => (
         <span className={`px-2 py-1 rounded-full text-sm ${params.value >= 8 ? 'bg-red-100 text-red-800' :
            params.value < 0.5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
            }`}>
            {params.value}
         </span>
      )
   },
   {
      field: 'sources',
      headerName: "Sources",
      renderCell: (params: GridRenderCellParams<any, Array<string>>) => (
         <div>
            {params.value?.map((src, idx) => 
               <Link
                  to={`/admin/report/${src}`}
                  className="btn btn-link"
               >
                  Source {idx+1}
               </Link>
            )}
         </div>
      )
   }
];

export default summaryColumns;