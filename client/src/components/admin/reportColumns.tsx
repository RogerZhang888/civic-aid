import { GridColDef } from "@mui/x-data-grid";
import { Report } from "../types";
import MediaRenderCell from "./MediaRenderCell";
import ActionRenderCell from "./ActionRenderCell";
import getBadgeClass from "../../hooks/getBadgeClass";

const reportColumns: GridColDef<Report>[] = [
   {
      field: 'id',
      headerName: 'Report ID',
      width: 120,
   },
   {
      field: 'userId',
      headerName: 'User ID',
      width: 80,
   },
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
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
         <div>
            {params.value}
         </div>
      )
   },
   {
      field: 'recommendedSteps',
      headerName: 'Recommended Steps',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
         <div>
            {params.value}
         </div>
      )
   },
   {
      field: 'mediaUrl',
      headerName: 'Media',
      renderCell: (params) => <MediaRenderCell {...params} />,
   },
   {
      field: 'agency',
      headerName: 'Agency',
      width: 120,
   },
   {
      field: 'status',
      headerName: 'Status',
      width: 120,
      type: 'string',
      headerAlign: "center",
      renderCell: (params) => (
         <span 
            className={
               `badge text-white
               ${getBadgeClass(params.value)}`
            }
         >
            {params.value}
         </span>
      )
   },
   {
      field: 'urgency',
      headerName: 'Urgency',
      width: 100,
      type: 'number',
      headerAlign: "center",
      renderCell: (params) => (
         <span className={`px-2 py-1 rounded-full text-sm ${params.value >= 8 ? 'bg-red-100 text-red-800' :
            params.value >= 0.5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
            }`}>
            {params.value.toFixed(2)}
         </span>
      )
   },
   {
      field: 'reportConfidence',
      headerName: 'Report Confidence',
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
      field: 'createdAt',
      headerName: 'Date Created',
      width: 150,
      type: 'dateTime',
      headerAlign: "center",
      valueFormatter: (v: Date) =>
         v?.toLocaleString() || 'N/A'
   },
   {
      field: 'resolvedAt',
      headerName: 'Date Resolved',
      width: 150,
      type: 'dateTime',
      valueFormatter: (v: Date | null) =>
         v?.toLocaleString() || 'N/A'
   },
   {
      field: 'isPublic',
      headerName: 'Public Report',
      width: 80,
      type: 'boolean',
   },
   {
      field: 'upvoteCount',
      headerName: 'Upvotes',
      width: 80,
      type: 'number',
      headerAlign: "center",
   },
   {
      field: 'remarks',
      headerName: 'Remarks',
      width: 120,
      type: 'string',
   },
   {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      renderCell: (params) => <ActionRenderCell {...params}/>
   }
];

export default reportColumns;