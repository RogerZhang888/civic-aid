import { GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import axios from 'axios';
import { useState, useRef } from 'react';
import { Report, ReportStatusTypes } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function ActionRenderCell(params: GridRenderCellParams<Report, any, any, GridTreeNodeWithRender>) {

   const [selectedStatus, setSelectedStatus] = useState(params.row.status || 'Pending');
   const [remarks, setRemarks] = useState(params.row.remarks || "");
   const dialogRef = useRef<HTMLDialogElement>(null);
   const queryClient = useQueryClient();
   const navigate = useNavigate();

   async function handleSave() {

      try {

         await axios.patch(
            `${SERVER_API_URL}/api/gov/reports/${params.row.id}`, 
            { 
               newStatus: selectedStatus,
               remarks
            },
            { withCredentials: true }
         );

         queryClient.refetchQueries({ queryKey: ['reports', "/gov/reports"] });
         toast.success('Report updated successfully');
   
      } catch (error) {

         console.error(`Error updating status: ${error}`);
         if (axios.isAxiosError(error)) {
            toast.error(`Error: ${error.response?.data.error || error.message}`);
         } else {
            toast.error('An unknown error occurred. Please try again later.');
         }
         
      } finally {
         dialogRef.current?.close();
      }
   };

   const openModal = () => {
      setSelectedStatus(params.row.status || 'Pending');
      setRemarks(params.row.remarks || "");
      dialogRef.current?.showModal();
   };
   const closeModal = () => dialogRef.current?.close();

   return (
      <div id="action-render-cell">
         <div className='join join-horizontal'>
            <button
               className="join-item btn btn-sm btn-primary"
               onClick={openModal}
            >
               Edit
            </button>
            <button
               className='join-item btn btn-sm btn-secondary'
               onClick={() => navigate(`/admin/report/${params.row.id}`)}
            >
               View
            </button>
         </div>

         <dialog ref={dialogRef} className="modal">
            <div className="modal-box">
               <div className="font-semibold text-lg m-3">Edit status to:</div>
               <div className="form-control">
                  <select
                     className="select select-bordered w-full"
                     value={selectedStatus}
                     onChange={(e) => setSelectedStatus(e.target.value as ReportStatusTypes)}
                  >
                     <option>pending</option>
                     <option>in progress</option>
                     <option>resolved</option>
                     <option>rejected</option>
                  </select>
               </div>
               <div className="font-semibold text-lg m-3">Edit remarks to:</div>
               <div className="form-control">
                  <textarea
                     className="textarea textarea-bordered w-full"
                     placeholder="Remarks"
                     value={remarks}
                     onChange={(e) => setRemarks(e.target.value)}
                  />
               </div>
               <div className="modal-action">
                  <button
                     className="btn btn-primary"
                     onClick={handleSave}
                  >
                     Save
                  </button>
                  <button
                     className="btn"
                     onClick={closeModal}
                  >
                     Cancel
                  </button>
               </div>
            </div>
         </dialog>
      </div>
   );
}