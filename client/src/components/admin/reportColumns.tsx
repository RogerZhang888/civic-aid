import { GridColDef } from "@mui/x-data-grid";
import { Report } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

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
   {
      field: 'mediaUrl',
      headerName: 'Media',
      renderCell: (params) => (
         <div id="media-render-cell">
            {params.value.length > 0
               ?  <>
                     <button className="btn btn-sm btn-info" onClick={() => (document!.getElementById('adnim-panel-report-image-model') as HTMLDialogElement | null)?.showModal()}>
                        View
                     </button>
                     <dialog id="adnim-panel-report-image-model" className="modal">
                        <div className="modal-box w-800">
                           <h3 className="font-semibold text-lg">Attached Images</h3>
                           <div className="carousel w-full">
                              {params.value.map((url: string, idx: number) => (
                                 <div id={`item${idx + 1}`} className="carousel-item w-full" key={idx}>
                                    <img
                                       src={`${SERVER_API_URL}/api/files/${url}`}
                                       alt={`media ${idx}`}
                                       className="w-full h-full object-cover"
                                    />
                                 </div>
                              ))}
                           </div>
                           <div className="flex w-full justify-center gap-2 py-2">
                              {params.value.map((_: string, idx: number) => (
                                 <a key={idx} href={`#item${idx + 1}`} className="btn btn-xs">{idx + 1}</a>
                              ))}
                           </div>
                           <div className="modal-action">
                              <form method="dialog">
                              <button className="btn">Close</button>
                              </form>
                           </div>
                        </div>
                     </dialog>
                  </>
               :  <div className="text-gray-500">No image</div>
            }
         </div>
      )
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
   {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      renderCell: () => (
         <div id="action-render-cell">
            <button className="btn btn-sm btn-primary" onClick={() => (document!.getElementById('admin-panel-report-edit-status-model') as HTMLDialogElement | null)?.showModal()}>
               Edit status
            </button>
            <dialog id="admin-panel-report-edit-status-model" className="modal">
               <div className="modal-box w-800">
                  <h3 className="font-semibold text-lg">Edit status to:</h3>
                  <div className="form-control">
                     <select className="select select-bordered w-full max-w-xs">
                        <option value="resolved">Resolved</option>
                        <option value="in-progress">In Progress</option>
                        <option value="pending">Pending</option>
                     </select>
                  </div>
                  <div className="modal-action">
                     <form method="dialog">
                     <button className="btn">Close</button>
                     </form>
                  </div>
               </div>
            </dialog>
         </div>
      )
   }
];

export default reportColumns;