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
      renderCell: (params) => (
         <div className="text-left">
            {params.value}
         </div>
      )
   },
   {
      field: 'urgency',
      headerName: 'Urgency',
      width: 100,
      type: 'number',
      headerAlign: "center",
      renderCell: (params) => {

         const u = params.value;
         const hueRotate = Math.round(120 - (u * 120));
         const saturation = 100 - (Math.abs(u - 0.5) * 40);

         return (
            <span 
               className="px-2 py-1 rounded-full text-sm font-medium"
               style={{
                  backgroundColor: `hsl(${hueRotate}, ${saturation}%, 90%)`,
                  color: `hsl(${hueRotate}, ${saturation}%, 30%)`
               }}
            >
               {u*100}
            </span>
         );
      }
   },
   {
      field: 'confidence',
      headerName: 'Confidence',
      width: 100,
      type: 'number',
      headerAlign: "center",
      renderCell: (params) => {
         const conf = params.value;
         const hueRotate = Math.round(conf * 120);
         const saturation = 100 - (Math.abs(conf - 0.5) * 40);
         
         return (
            <span 
               className="px-2 py-1 rounded-full text-sm font-medium"
               style={{
                  backgroundColor: `hsl(${hueRotate}, ${saturation}%, 90%)`,
                  color: `hsl(${hueRotate}, ${saturation}%, 30%)`
               }}
            >
               {conf*100}
            </span>
         );
      }
   },
   {
      field: 'sources',
      headerName: "Sources",
      renderCell: (params: GridRenderCellParams<any, Array<string>>) => (
         <div className="flex flex-col space-y-1">
            {params.value?.map((src, idx) => 
               <Link
                  key={idx}
                  to={`/admin/report/${src}`}
                  className="btn btn-link btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  Source {idx+1}
               </Link>
            )}
         </div>
      )
   }
];

export default summaryColumns;