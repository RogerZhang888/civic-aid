import { GridColDef } from "@mui/x-data-grid";
import { Report } from "../types";

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
      minWidth: 150,
      renderCell: (params) => (
         <div>
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
      field: 'recommended_steps',
      headerName: 'Recommended Steps',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
         <div>
            {params.value}
         </div>
      )
   },
   // add media (todo)
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
      renderCell: (params) => (
         <span className={`px-2 py-1 rounded-full text-sm ${params.value === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
            {params.value}
         </span>
      )
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

   // ACTIONS
   {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      hideable: false,
      type: 'actions',
      renderCell: () => (
         <div className="flex space-x-2">
            <button className="text-blue-500 hover:text-blue-700">View</button>
            <button className="text-red-500 hover:text-red-700">Delete</button>
         </div>
      )
   }
];

export default reportColumns;